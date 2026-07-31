#!/usr/bin/env python3
"""Import an Overture Places city extract into JSON and optionally Supabase.

The service-role key is used only by this local/admin script. Never expose it
through an EXPO_PUBLIC_* variable or bundle it with the application.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

try:
    import duckdb
except ImportError:
    sys.exit(
        "DuckDB ausente. Execute: "
        "python -m pip install -r scripts/requirements-overture.txt"
    )


DEFAULT_RELEASE = "2026-06-17.0"
DEFAULT_BBOX = (-49.46, -20.92, -49.29, -20.74)
DEFAULT_OUTPUT = Path("src/data/externalPlacesSeed.json")

CATEGORY_LABELS = {
    "restaurant": "Restaurante",
    "bar": "Bar",
    "casual_eatery": "Lanches e sobremesas",
    "coffee_shop": "Cafeteria",
    "food_truck": "Food truck",
}


def parse_bbox(raw: str) -> tuple[float, float, float, float]:
    values = tuple(float(part.strip()) for part in raw.split(","))
    if len(values) != 4:
        raise argparse.ArgumentTypeError("Use oeste,sul,leste,norte.")
    west, south, east, north = values
    if west >= east or south >= north:
        raise argparse.ArgumentTypeError("Bounding box inválida.")
    return west, south, east, north


def category_label(basic_category: str | None, category: str | None) -> str:
    if basic_category in CATEGORY_LABELS:
        return CATEGORY_LABELS[basic_category]
    text = (category or "").replace("_", " ").strip()
    return text.capitalize() if text else "Gastronomia"


def extract_places(
    release: str,
    bbox: tuple[float, float, float, float],
    limit: int,
) -> list[dict]:
    west, south, east, north = bbox
    source_path = (
        "s3://overturemaps-us-west-2/release/"
        f"{release}/theme=places/type=place/*"
    )
    connection = duckdb.connect()
    connection.execute("SET s3_region='us-west-2'")
    rows = connection.execute(
        f"""
        select
          id,
          names.primary as name,
          basic_category,
          categories.primary as category,
          addresses[1].freeform as address,
          addresses[1].locality as city,
          addresses[1].postcode as postcode,
          addresses[1].region as state,
          addresses[1].country as country_code,
          bbox.xmin as longitude,
          bbox.ymin as latitude,
          confidence,
          operating_status,
          sources[1].license as source_license,
          sources[1].update_time as source_updated_at
        from read_parquet(?, hive_partitioning=1)
        where bbox.xmin between ? and ?
          and bbox.ymin between ? and ?
          and names.primary is not null
          and coalesce(operating_status, 'open') <> 'closed'
          and (
            basic_category in (
              'restaurant', 'bar', 'casual_eatery', 'coffee_shop', 'food_truck'
            )
            or categories.primary similar to
              '%(restaurant|cafe|coffee|bar|bakery|burger|pizza|sushi)%'
          )
        order by confidence desc nulls last, names.primary
        limit ?
        """,
        [source_path, west, east, south, north, limit],
    ).fetchall()
    columns = [description[0] for description in connection.description]
    synced_at = datetime.now(timezone.utc).isoformat()
    result = []
    for values in rows:
        row = dict(zip(columns, values))
        result.append(
            {
                "id": f"overture-{row['id']}",
                "source": "overture",
                "sourceId": row["id"],
                "name": row["name"],
                "type": category_label(row["basic_category"], row["category"]),
                "basicCategory": row["basic_category"],
                "category": row["category"],
                "address": row["address"] or "",
                "district": "",
                "city": row["city"] or "São José do Rio Preto",
                "state": row["state"] or "SP",
                "postcode": row["postcode"] or "",
                "countryCode": row["country_code"] or "BR",
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "confidence": (
                    round(float(row["confidence"]), 6)
                    if row["confidence"] is not None
                    else None
                ),
                "operatingStatus": row["operating_status"] or "",
                "sourceLicense": row["source_license"] or "",
                "sourceUpdatedAt": row["source_updated_at"] or "",
                "lastSyncedAt": synced_at,
                "status": "active",
                "isExternal": True,
            }
        )
    return result


def supabase_row(place: dict) -> dict:
    return {
        "source": place["source"],
        "source_id": place["sourceId"],
        "name": place["name"],
        "basic_category": place["basicCategory"],
        "category": place["category"],
        "address": place["address"],
        "district": place["district"],
        "city": place["city"],
        "state": place["state"],
        "postcode": place["postcode"],
        "country_code": place["countryCode"],
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "confidence": place["confidence"],
        "operating_status": place["operatingStatus"] or None,
        "source_license": place["sourceLicense"],
        "source_updated_at": place["sourceUpdatedAt"] or None,
        "last_synced_at": place["lastSyncedAt"],
        "status": place["status"],
    }


def upsert_supabase(places: list[dict], url: str, service_key: str) -> None:
    endpoint = (
        f"{url.rstrip('/')}/rest/v1/external_places"
        "?on_conflict=source,source_id"
    )
    payload = json.dumps(
        [supabase_row(place) for place in places], ensure_ascii=False
    ).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            if response.status not in (200, 201, 204):
                raise RuntimeError(f"Supabase respondeu HTTP {response.status}.")
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Falha no Supabase ({error.code}): {details}") from error


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--release", default=DEFAULT_RELEASE)
    parser.add_argument(
        "--bbox",
        type=parse_bbox,
        default=DEFAULT_BBOX,
        help="oeste,sul,leste,norte",
    )
    parser.add_argument("--limit", type=int, default=120)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--push",
        action="store_true",
        help="Faz upsert usando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    )
    args = parser.parse_args()

    places = extract_places(args.release, args.bbox, max(1, args.limit))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(places, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"{len(places)} locais gravados em {args.output}")

    if args.push:
        url = os.environ.get("SUPABASE_URL", "")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not service_key:
            sys.exit(
                "Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para usar --push."
            )
        upsert_supabase(places, url, service_key)
        print(f"{len(places)} locais enviados ao Supabase.")


if __name__ == "__main__":
    main()
