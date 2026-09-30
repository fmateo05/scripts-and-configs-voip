import random
import sqlite3
from typing import Optional

import httpx
from fastapi import Body, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware

# ... resto del código ...

app = FastAPI(title="Kazoo Phonebook Mock API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "kazoo_phone_pool.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Crea la tabla phone_pool y puebla los números iniciales si está vacía."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS phone_pool (
                number TEXT PRIMARY KEY,
                status TEXT DEFAULT 'available',
                assigned_to_device TEXT,
                assigned_at INTEGER
            )
        """)

        # Verificar si hay números; si la tabla está vacía, insertar DIDs de prueba
        cursor = conn.execute("SELECT COUNT(*) as count FROM phone_pool")
        if cursor.fetchone()["count"] == 0:
            initial_dids = [
                "+18295550101",
                "+18295550102",
                "+18295550103",
                "+18295550104",
                "+18295550105",
                "+18092672505",
                "+18095550200"
            ]
            for did in initial_dids:
                conn.execute(
                    "INSERT INTO phone_pool (number, status) VALUES (?, 'available')",
                    (did,)
                )
            conn.commit()
            print("[SQLite] Base de datos inicializada y pool cargado de DIDs.")

# IMPORTANTE: Ejecutar la inicialización al cargar el módulo
init_db()





# -------------------------------------------------------------------
# ENDPOINTS KNM LOCALITY & PHONEBOOK SEARCH
# -------------------------------------------------------------------
@app.get("/numbers/us/search")
@app.get("/v2/numbers/us/search")
@app.get("/accounts/{account_id}/numbers/us/search")
@app.get("/v2/accounts/{account_id}/numbers/us/search")
async def knm_search_numbers(
    prefix: str = Query("829"),
    limit: int = Query(15),
    offset: int = Query(0),
    quantity: int = Query(15)
):
    """
    Simula la búsqueda de DIDs disponibles en KNM Locality según el prefijo (NPA/NXX).
    Devuelve los números libres del pool SQLite o los genera dinámicamente si faltan.
    """
    clean_prefix = prefix.replace("+", "").strip()
    results = []

    # 1. Intentar obtener números disponibles del pool SQLite que coincidan con el prefijo
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT number FROM phone_pool WHERE status = 'available' AND number LIKE ? LIMIT ?",
            (f"%{clean_prefix}%", limit)
        )
        rows = cursor.fetchall()
        for r in rows:
            results.append(r["number"])

    # 2. Si el pool no tiene suficientes números con ese prefijo, generar dinámicamente
    needed = limit - len(results)
    if needed > 0:
        for _ in range(needed):
            suffix = "".join([str(random.randint(0, 9)) for _ in range(7 - len(clean_prefix) if len(clean_prefix) <= 7 else 4)])
            new_did = f"+1{clean_prefix}{suffix}"
            if new_did not in results:
                results.append(new_did)

    # 3. Formatear la respuesta como la espera KNM Locality / Monster UI
    formatted_data = {}
    for num in results:
        clean_num = num.replace("+", "")
        formatted_data[num] = {
            "number": num,
            "friendly_name": f"+1 ({clean_num[1:4]}) {clean_num[4:7]}-{clean_num[7:]}",
            "state": "available",
            "locality": "Santo Domingo",
            "rate_center": "SANTO DOMINGO",
            "region": "DO"
        }

    return {
        "status": "success",
        "data": formatted_data,
        "page_size": len(results),
        "start_key": offset
    }


@app.get("/accounts/{account_id}/phonebook")
@app.get("/v2/accounts/{account_id}/phonebook")
async def get_phonebook(account_id: str):
    """
    Suministra el listado del Phonebook/Directorio de la cuenta.
    """
    phonebook_entries = []
    
    # Extraer entradas desde los dispositivos registrados en memoria
    for dev_id, dev in devices_db.items():
        mdn = dev.get("mdn") or dev.get("mobile", {}).get("mdn", "")
        if mdn:
            phonebook_entries.append({
                "id": dev_id,
                "name": dev.get("name", "Dispositivo Móvil"),
                "number": mdn,
                "type": "mobile",
                "owner": dev.get("name", "Usuario")
            })

    return {
        "status": "success",
        "data": phonebook_entries
    }
