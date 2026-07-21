import { restaurant as FlorDeSalBistro } from './flor-de-sal-bistro/data';
import { products as FlorDeSalBistroProducts } from './flor-de-sal-bistro/products';
import { restaurant as LosteriaRioPreto } from './losteria-rio-preto/data';
import { products as LosteriaRioPretoProducts } from './losteria-rio-preto/products';
import { restaurant as RanchoDoCupim } from './rancho-do-cupim/data';
import { products as RanchoDoCupimProducts } from './rancho-do-cupim/products';
import { restaurant as JangadaRioPreto } from './jangada-rio-preto/data';
import { products as JangadaRioPretoProducts } from './jangada-rio-preto/products';
import { restaurant as FarrougrillRioPreto } from './farrougrill-rio-preto/data';
import { products as FarrougrillRioPretoProducts } from './farrougrill-rio-preto/products';
import { restaurant as Zappas } from './zappas/data';
import { products as ZappasProducts } from './zappas/products';
import { restaurant as Tassinari } from './tassinari/data';
import { products as TassinariProducts } from './tassinari/products';
import { restaurant as BarDoPortugues } from './bar-do-portugues/data';
import { products as BarDoPortuguesProducts } from './bar-do-portugues/products';
import { restaurant as BellaCapriRedentora } from './bella-capri-redentora/data';
import { products as BellaCapriRedentoraProducts } from './bella-capri-redentora/products';
import { restaurant as CocoBambuRioPreto } from './coco-bambu-rio-preto/data';
import { products as CocoBambuRioPretoProducts } from './coco-bambu-rio-preto/products';
import { restaurant as ButecoDoGaucho } from './buteco-do-gaucho/data';
import { products as ButecoDoGauchoProducts } from './buteco-do-gaucho/products';
import { restaurant as ChicoBarrigudo } from './chico-barrigudo/data';
import { products as ChicoBarrigudoProducts } from './chico-barrigudo/products';
import { restaurant as DonLeonRioPreto } from './don-leon-rio-preto/data';
import { products as DonLeonRioPretoProducts } from './don-leon-rio-preto/products';
import { restaurant as BartolomeuJk } from './bartolomeu-jk/data';
import { products as BartolomeuJkProducts } from './bartolomeu-jk/products';
import { restaurant as McdonaldsPlazaAvenida } from './mcdonalds-plaza-avenida/data';
import { products as McdonaldsPlazaAvenidaProducts } from './mcdonalds-plaza-avenida/products';
import { restaurant as BurgerKingPlazaAvenida } from './burger-king-plaza-avenida/data';
import { products as BurgerKingPlazaAvenidaProducts } from './burger-king-plaza-avenida/products';
import { restaurant as PipperSteakhouse } from './pipper-steakhouse/data';
import { products as PipperSteakhouseProducts } from './pipper-steakhouse/products';
import { restaurant as LaBrasaBurger } from './la-brasa-burger/data';
import { products as LaBrasaBurgerProducts } from './la-brasa-burger/products';
import { restaurant as LaFruttaAcai } from './la-frutta-acai/data';
import { products as LaFruttaAcaiProducts } from './la-frutta-acai/products';
import { restaurant as FDeFrango } from './f-de-frango/data';
import { products as FDeFrangoProducts } from './f-de-frango/products';
import { restaurant as Dittus } from './dittus/data';
import { products as DittusProducts } from './dittus/products';
import { restaurant as SucosMoenda } from './sucos-moenda/data';
import { products as SucosMoendaProducts } from './sucos-moenda/products';
import { restaurant as BbOncaBurguers } from './bb-onca-burguers/data';
import { products as BbOncaBurguersProducts } from './bb-onca-burguers/products';
import { restaurant as ChBurguers } from './ch-burguers/data';
import { products as ChBurguersProducts } from './ch-burguers/products';
import { restaurant as PaprikaRestaurante } from './paprika-restaurante/data';
import { products as PaprikaRestauranteProducts } from './paprika-restaurante/products';
import { restaurant as ReiDoPaoDeQueijo } from './rei-do-pao-de-queijo/data';
import { products as ReiDoPaoDeQueijoProducts } from './rei-do-pao-de-queijo/products';
import { restaurant as MamaMiaRioPreto } from './mama-mia-rio-preto/data';
import { products as MamaMiaRioPretoProducts } from './mama-mia-rio-preto/products';
import { restaurant as FamigliaArnoni } from './famiglia-arnoni/data';
import { products as FamigliaArnoniProducts } from './famiglia-arnoni/products';
import { restaurant as MakisuRioPreto } from './makisu-rio-preto/data';
import { products as MakisuRioPretoProducts } from './makisu-rio-preto/products';
import { restaurant as SrFilet } from './sr-filet/data';
import { products as SrFiletProducts } from './sr-filet/products';
import { restaurant as BlueJasmim } from './blue-jasmim/data';
import { products as BlueJasmimProducts } from './blue-jasmim/products';
import { restaurant as VitorFalcochioTeste } from './vitor-falcochio-teste/data';
import { products as VitorFalcochioTesteProducts } from './vitor-falcochio-teste/products';

function withMenu(restaurant, menu) {
  return {
    ...restaurant,
    menu,
    menuItems: restaurant.menuItems?.length ? restaurant.menuItems : menu
  };
}

export const restaurantsCatalog = [
  withMenu(FlorDeSalBistro, FlorDeSalBistroProducts),
  withMenu(LosteriaRioPreto, LosteriaRioPretoProducts),
  withMenu(RanchoDoCupim, RanchoDoCupimProducts),
  withMenu(JangadaRioPreto, JangadaRioPretoProducts),
  withMenu(FarrougrillRioPreto, FarrougrillRioPretoProducts),
  withMenu(Zappas, ZappasProducts),
  withMenu(Tassinari, TassinariProducts),
  withMenu(BarDoPortugues, BarDoPortuguesProducts),
  withMenu(BellaCapriRedentora, BellaCapriRedentoraProducts),
  withMenu(CocoBambuRioPreto, CocoBambuRioPretoProducts),
  withMenu(ButecoDoGaucho, ButecoDoGauchoProducts),
  withMenu(ChicoBarrigudo, ChicoBarrigudoProducts),
  withMenu(DonLeonRioPreto, DonLeonRioPretoProducts),
  withMenu(BartolomeuJk, BartolomeuJkProducts),
  withMenu(McdonaldsPlazaAvenida, McdonaldsPlazaAvenidaProducts),
  withMenu(BurgerKingPlazaAvenida, BurgerKingPlazaAvenidaProducts),
  withMenu(PipperSteakhouse, PipperSteakhouseProducts),
  withMenu(LaBrasaBurger, LaBrasaBurgerProducts),
  withMenu(LaFruttaAcai, LaFruttaAcaiProducts),
  withMenu(FDeFrango, FDeFrangoProducts),
  withMenu(Dittus, DittusProducts),
  withMenu(SucosMoenda, SucosMoendaProducts),
  withMenu(BbOncaBurguers, BbOncaBurguersProducts),
  withMenu(ChBurguers, ChBurguersProducts),
  withMenu(PaprikaRestaurante, PaprikaRestauranteProducts),
  withMenu(ReiDoPaoDeQueijo, ReiDoPaoDeQueijoProducts),
  withMenu(MamaMiaRioPreto, MamaMiaRioPretoProducts),
  withMenu(FamigliaArnoni, FamigliaArnoniProducts),
  withMenu(MakisuRioPreto, MakisuRioPretoProducts),
  withMenu(SrFilet, SrFiletProducts),
  withMenu(BlueJasmim, BlueJasmimProducts),
  withMenu(VitorFalcochioTeste, VitorFalcochioTesteProducts)
];

export const seedRestaurants = restaurantsCatalog;
