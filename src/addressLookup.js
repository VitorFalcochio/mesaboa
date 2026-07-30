const DEFAULT_CITY = 'São José do Rio Preto';
const DEFAULT_STATE = 'SP';

function optionalCoordinate(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export function onlyAddressDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function formatCep(value) {
  const digits = onlyAddressDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function extractAddressNumber(value) {
  const input = String(value || '').trim();
  if (!input || onlyAddressDigits(input).length === 8 && /^[\d\s-]+$/.test(input)) return '';
  const commaMatch = input.match(/,\s*(\d+[A-Za-z]?(?:\s*[-/]\s*\d+[A-Za-z]?)?)(?:\s|$)/);
  if (commaMatch?.[1]) return commaMatch[1].replace(/\s+/g, '');
  const trailingMatch = input.match(/\s(\d+[A-Za-z]?)(?:\s*[-–]\s*[^,]+)?$/);
  return trailingMatch?.[1] || '';
}

export function streetSearchTerm(value) {
  const input = String(value || '').trim();
  if (!input || onlyAddressDigits(input).length === 8 && /^[\d\s-]+$/.test(input)) return '';
  return input
    .replace(/,\s*\d+[A-Za-z]?(?:\s*[-/]\s*\d+[A-Za-z]?)?.*$/, '')
    .replace(/\s+\d+[A-Za-z]?$/, '')
    .trim();
}

export function normalizeViaCepAddress(item = {}) {
  return {
    cep: formatCep(item.cep),
    street: String(item.street || item.logradouro || '').trim(),
    complement: String(item.complement || item.complemento || '').trim(),
    district: String(item.district || item.neighborhood || item.bairro || '').trim(),
    city: String(item.city || item.localidade || DEFAULT_CITY).trim(),
    state: String(item.state || item.uf || DEFAULT_STATE).trim().toUpperCase(),
    latitude: optionalCoordinate(item.latitude),
    longitude: optionalCoordinate(item.longitude)
  };
}

export function formatAddressLabel(item, number = '') {
  const address = normalizeViaCepAddress(item);
  const streetLine = [address.street, number].filter(Boolean).join(', ');
  return [
    streetLine,
    address.complement,
    address.district,
    [address.city, address.state].filter(Boolean).join(' - '),
    address.cep
  ].filter(Boolean).join(' · ');
}

export async function lookupAddressByCep(value, fetchImpl = fetch) {
  const cep = onlyAddressDigits(value);
  if (cep.length !== 8) return null;
  let viaCepAddress = null;
  try {
    const response = await fetchImpl(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      if (!result?.erro) viaCepAddress = normalizeViaCepAddress(result);
    }
  } catch (error) {
    viaCepAddress = null;
  }

  try {
    const response = await fetchImpl(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      const latitude = optionalCoordinate(result?.location?.coordinates?.latitude);
      const longitude = optionalCoordinate(result?.location?.coordinates?.longitude);
      return normalizeViaCepAddress({
        ...result,
        ...(viaCepAddress || {}),
        latitude: latitude ?? viaCepAddress?.latitude,
        longitude: longitude ?? viaCepAddress?.longitude
      });
    }
  } catch (error) {
    // ViaCEP remains the address fallback when BrasilAPI is unavailable.
  }

  return viaCepAddress;
}

export async function searchAddresses(
  value,
  { city = DEFAULT_CITY, state = DEFAULT_STATE, limit = 6 } = {},
  fetchImpl = fetch
) {
  const street = streetSearchTerm(value);
  if (street.length < 3) return [];
  const url = `https://viacep.com.br/ws/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('address_search_failed');
  const result = await response.json();
  if (!Array.isArray(result)) return [];
  const seen = new Set();
  return result
    .map(normalizeViaCepAddress)
    .filter((item) => item.street && item.city && item.state)
    .filter((item) => {
      const key = `${item.cep}:${item.street}:${item.district}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

export const defaultAddressCity = DEFAULT_CITY;
export const defaultAddressState = DEFAULT_STATE;
