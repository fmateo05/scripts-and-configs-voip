import sqlite3
import random
import httpx
import time
import re
from typing import Optional
from fastapi import Body, FastAPI, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(redirect_slashes=False)
print("¡La API con Pool de DIDs en SQLite se está ejecutando!")

KAZOO_REAL_API = "http://127.0.0.1:8000"
DB_FILE = "kazoo_phone_pool.db"

# -------------------------------------------------------------------
# CONFIGURACIÓN CORS
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# GESTIÓN DE BASE DE DATOS Y POOL DE DIDS (SQLite)
# -------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa las tablas y puebla el pool de DIDs si está vacío."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS phone_pool (
                number TEXT PRIMARY KEY,
                status TEXT DEFAULT 'available', -- 'available', 'assigned'
                assigned_to_device TEXT,
                assigned_at INTEGER
            )
        """)

        # Verificar si hay números en el pool; si no, agregar números de prueba
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
                conn.execute("INSERT INTO phone_pool (number, status) VALUES (?, 'available')", (did,))
            conn.commit()

init_db()

def get_device_info_from_imei(imei: str) -> dict:
    """
    Analiza el IMEI/ESN para determinar el fabricante y modelo.
    Los primeros 8 dígitos del IMEI corresponden al TAC (Type Allocation Code).
    """
    clean_imei = re.sub(r'\D', '', imei or '')
#   tac = clean_imei[:8] if len(clean_imei) >= 8 else ""
    tac = clean_imei[:6] if len(clean_imei) >= 6 else ""

    # Tabla de prefijos TAC conocidos
    tac_map = {
        # Apple
        "35332810": {"manufacturer": "Apple", "name": "iPhone 11 Pro"},
        "35669148": {"manufacturer": "Apple", "name": "iPhone 12"},
        "35298111": {"manufacturer": "Apple", "name": "iPhone 13"},
        "35401111": {"manufacturer": "Apple", "name": "iPhone 14"},
        # Samsung
        "370012": {"manufacturer": "lg", "name": "d820"},
        "370013": {"manufacturer": "lg", "name": "h790"},
        "370014": {"manufacturer": "Samsung", "name": "g930"},
        #
        "35891210": {"manufacturer": "Samsung", "name": "Galaxy S21"},
        "35210911": {"manufacturer": "Samsung", "name": "Galaxy S22"},
        "35123409": {"manufacturer": "Samsung", "name": "Galaxy S23"},
        # Google
        "370011": {"manufacturer": "apple", "name": "iphone"},
        "370018": {"manufacturer": "htc", "name": "x325c"},
        "370019": {"manufacturer": "htc", "name": "831c"},
        "370010": {"manufacturer": "Google", "name": "Pixel 4 XL"},
        "37001000": {"manufacturer": "Google", "name": "Pixel 4 XL"},
        "35281910": {"manufacturer": "Google", "name": "Pixel 6 Pro"},
        # Xiaomi / Poco
        "370015": {"manufacturer": "Xiaomi", "name": "Redmi Note"},
        "370016": {"manufacturer": "Xiaomi", "name": "Redmi Note"},
        "370017": {"manufacturer": "Xiaomi", "name": "Redmi Note"},
        "86421004": {"manufacturer": "Xiaomi", "name": "Redmi Note"},
    }

    if tac in tac_map:
        return tac_map[tac]

    # Fallback por rango o reglas generales si no coincide el TAC exacto
    if clean_imei.startswith("35") or clean_imei.startswith("01"):
        # La gran mayoría de dispositivos Apple / Samsung / Google inician en 35 o 01
        if "3700" in clean_imei:
            return {"manufacturer": "Google", "name": "Google Pixel"}
        return {"manufacturer": "Generic", "name": "Mobile Device"}

    return {"manufacturer": "Generic", "name": "Mobile Device"}

def pop_available_did(device_id: str) -> str:
    """Busca el primer DID disponible en la DB, lo marca como asignado y lo retorna."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT number FROM phone_pool WHERE status = 'available' LIMIT 1"
        )
        row = cursor.fetchone()

        if row:
            selected_did = row["number"]
            conn.execute(
                "UPDATE phone_pool SET status = 'assigned', assigned_to_device = ?, assigned_at = ? WHERE number = ?",
                (device_id, int(time.time()), selected_did)
            )
            conn.commit()
            return selected_did
        else:
            # Fallback si el pool se agota: generar número y registrarlo asignado
            fallback_did = f"+1829{random.randint(1000000, 9999999)}"
            conn.execute(
                "INSERT INTO phone_pool (number, status, assigned_to_device, assigned_at) VALUES (?, 'assigned', ?, ?)",
                (fallback_did, device_id, int(time.time()))
            )
            conn.commit()
            return fallback_did

# -------------------------------------------------------------------
# ESTADO EN MEMORIA PARA DISPOSITIVOS Y CALLFLOWS
# -------------------------------------------------------------------
ACCOUNT_ID = "4409b1f0000000000000000000000000"

mock_account_data = {
    "id": ACCOUNT_ID,
    "name": "Cuenta Pruebas Mobile",
    "realm": "ims.mnc001.mcc370.3gppnetwork.org",
    "data": {
        "blocking": {"cap": 10000000000},
        "throttling": {"cap": 8000000000, "rate": "128k"},
    },
    "device_defaults": {
        "data": {
            "blocking": {"cap": 5000000000},
            "throttling": {"cap": 4000000000, "rate": "64k"},
        },
        "features": ["mms", "tethering"],
    },
}

devices_db = {}
users_db = [
    {
#       "id": "usr_001",
        "first_name": "Felipe",
        "last_name": "Mateo",
        "email": "felipe@example.com",
    }
]
voicemail_boxes_db = [
    {"id": "vm_001", "name": "Buzón Principal", "owner_id": "usr_001", "mailbox": "100"}
]
callflows_db = []
ports_db = []

#def generate_random_esn():
#    return "".join([str(random.randint(0, 9)) for _ in range(15)])
def generate_random_esn():
    plmn = "37001"  # MCC 370 (Dominican Republic) + MNC 01
    msin = "".join([str(random.randint(0, 9)) for _ in range(10)])
    return f"{plmn}{msin}"

# -------------------------------------------------------------------
# ENDPOINTS ACCOUNTS & USAGE
# -------------------------------------------------------------------
@app.get("/accounts/{account_id}")
@app.get("/v2/accounts/{account_id}")
async def get_account(account_id: str):
    return {"status": "success", "data": mock_account_data}

@app.post("/accounts/{account_id}")
@app.post("/v2/accounts/{account_id}")
@app.post("/v2/accounts/{account_id}/data_cap")
async def update_account_data_caps(account_id: str, payload: dict = Body(...)):
    if "data" in payload:
        mock_account_data["data"] = payload["data"]
    return {"status": "success", "data": mock_account_data}

@app.get("/v2/accounts/{account_id}/usage")
@app.get("/v2/accounts/{account_id}/usage/")
@app.get("/accounts/{account_id}/usage")
async def top_get_account_usage(account_id: str):
    return {
        "status": "success",
        "data": {
            "total": 3500000000,
            "total_usage": 150000000
        }
    }

# -------------------------------------------------------------------
# ENDPOINTS DEVICES (ACTIVACIÓN CON SELECCIÓN AUTOMÁTICA DE DID)
# -------------------------------------------------------------------
@app.get("/v2/accounts/{account_id}/devices")
@app.get("/accounts/{account_id}/devices")
async def list_devices(
    account_id: str,
    request: Request,
    filter_device_type: Optional[str] = None,
    filter_mobile_mdn: Optional[str] = Query(None, alias="filter_mobile.mdn"),
):
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() in ["x-auth-token", "authorization"]
    }

    kazoo_devices = []

    try:
        async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
            resp = await client.get(
                f"{KAZOO_REAL_API}/v2/accounts/{account_id}/devices",
                headers=headers,
            )
            if resp.status_code == 200:
                payload = resp.json()
                raw_data = payload.get("data", [])
                if isinstance(raw_data, list):
                    kazoo_devices = raw_data
    except Exception as e:
        print(f"[GET Devices Fallback] Error: {e}")

    # Combinar con los locales
    combined_devices = {}
    for dev_id, dev_obj in devices_db.items():
        combined_devices[dev_id] = dev_obj

    for dev in kazoo_devices:
        dev_id = dev.get("id")
        if dev_id:
            combined_devices[dev_id] = dev

    data_list = list(combined_devices.values())

    # --- SANEAMIENTO Y ESTRUCTURA DE CAPS PARA LA UI ---
    for dev in data_list:
        mdn_val = (
            dev.get("mdn")
            or dev.get("mobile", {}).get("mdn")
            or dev.get("subscription", {}).get("mdn", "")
        )

        dev["device_type"] = dev.get("device_type") or "mobile"
        if mdn_val:
            dev["mdn"] = mdn_val

        # GARANTIZAR LA ESTRUCTURA DE 'data' Y 'cap' PARA EVITAR EL TypeError
        if "data" not in dev or not isinstance(dev["data"], dict):
            dev["data"] = {}

        if "blocking" not in dev["data"] or not isinstance(
            dev["data"]["blocking"], dict
        ):
            dev["data"]["blocking"] = {"cap": 10000000000}
        elif "cap" not in dev["data"]["blocking"]:
            dev["data"]["blocking"]["cap"] = 10000000000

        if "throttling" not in dev["data"] or not isinstance(
            dev["data"]["throttling"], dict
        ):
            dev["data"]["throttling"] = {"cap": 8000000000, "rate": "128k"}
        elif "cap" not in dev["data"]["throttling"]:
            dev["data"]["throttling"]["cap"] = 8000000000

    # Aplicar filtros
    if filter_mobile_mdn:
        data_list = [
            d
            for d in data_list
            if d.get("mdn") == filter_mobile_mdn
            or d.get("mobile", {}).get("mdn") == filter_mobile_mdn
        ]

    if filter_device_type:
        data_list = [
            d
            for d in data_list
            if d.get("device_type") == filter_device_type
            or (
                filter_device_type == "mobile"
                and (d.get("mobile") or d.get("mdn"))
            )
        ]

    return {"status": "success", "data": data_list}

def generate_fresh_unique_mdn(used_set: set) -> str:
    """Genera un DID aleatorio garantizando que no esté repetido."""
    while True:
        subscriber = "".join([str(random.randint(0, 9)) for _ in range(7)])
        candidate = f"+1829{subscriber}"
        if candidate not in used_set and candidate.replace("+", "") not in used_set:
            return candidate

@app.post("/v2/accounts/{account_id}/devices")
@app.put("/v2/accounts/{account_id}/devices")
@app.post("/accounts/{account_id}/devices/activate")
@app.put("/accounts/{account_id}/devices")
async def activate_or_create_device(
    account_id: str, request: Request, payload: dict = Body(...)
):
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() in ["x-auth-token", "authorization", "content-type"]
    }

    # Extractor defensivo si el payload viene envuelto en {"data": {...}}
    incoming_data = payload.get("data", payload) if isinstance(payload, dict) else payload

    # Determinar el tipo de dispositivo que la interfaz intenta crear
    raw_device_type = (
        incoming_data.get("device_type")
        or incoming_data.get("type")
        or "mobile"
    )
    device_type = str(raw_device_type).lower()

    device_id = (
        incoming_data.get("id")
        or payload.get("id")
        or f"dev_{random.randint(1000, 9999)}"
    )

    # =========================================================================
    # RAMA A: DISPOSITIVOS MÓVILES (Procesamiento de ESN, DID, Throttling, etc.)
    # =========================================================================
    if device_type == "mobile":
        assigned_mdn = incoming_data.get("mdn")

        # 1. Búsqueda de DID vía Locality / Phone Numbers Search
        if not assigned_mdn:
            postal_code = incoming_data.get("postal_code", "11519")
            search_prefix = "829"

            try:
                async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
                    print(f"[Locality Search] Buscando DIDs con prefijo {search_prefix}...")
                    search_url = f"{KAZOO_REAL_API}/v2/accounts/{account_id}/phone_numbers/search?prefix={search_prefix}&quantity=1"
                    resp = await client.get(search_url, headers=headers)

                    if resp.status_code == 200:
                        found_numbers = resp.json().get("data", [])
                        if isinstance(found_numbers, list) and len(found_numbers) > 0:
                            candidate_did = found_numbers[0].get("number") or found_numbers[0]
                            print(f"[Locality Search] DID encontrado: {candidate_did}")

                            assign_resp = await client.put(
                                f"{KAZOO_REAL_API}/v2/accounts/{account_id}/phone_numbers/{candidate_did}",
                                json={"data": {}},
                                headers=headers,
                            )
                            if assign_resp.status_code in [200, 201]:
                                assigned_mdn = candidate_did
                                print(f"[Locality Reserve] DID {candidate_did} reservado.")
            except Exception as e:
                print(f"[Locality Search Fallback] Error en búsqueda Kazoo: {e}")

        # 2. Fallbacks de DID (SQLite local o generador)
        if not assigned_mdn:
            assigned_mdn = pop_available_did(device_id)
            if assigned_mdn:
                print(f"[SQLite Pool] DID asignado: {assigned_mdn}")

        if not assigned_mdn:
            used_mdns = {d.get("mdn") for d in devices_db.values() if d.get("mdn")}
            assigned_mdn = generate_fresh_unique_mdn(used_mdns)
            print(f"[Random Fallback] DID asignado: {assigned_mdn}")

        # 3. Construcción del payload Móvil
        clean_mdn = assigned_mdn.replace("+", "")
        assigned_esn = incoming_data.get("esn") or generate_random_esn()
        device_info = get_device_info_from_imei(assigned_esn)
        manufacturer = device_info["manufacturer"]
        device_model = device_info["name"]
        custom_name = incoming_data.get("name") or f"{manufacturer} {device_model}"

        device_payload = {
            "name": custom_name,
            "id": assigned_esn,
            "device_type": "mobile",
            "enabled": True,
            "mdn": clean_mdn,
            "esn": assigned_esn,
            "postal_code": incoming_data.get("postal_code", "11519"),
            "mobile": {
                "id": device_id,
                "mdn": assigned_mdn,
                "esn": assigned_esn,
            },
            "subscription": {
                "mdn": assigned_mdn,
                "esn": assigned_esn,
                "features": incoming_data.get("subscription", {}).get(
                    "features", ["mms", "tethering"]
                ),
                "suspended": False,
            },
            "model": incoming_data.get(
                "model",
                {"manufacturer": manufacturer, "name": custom_name, "number": "14"},
            ),
            "data": incoming_data.get(
                "data",
                {
                    "blocking": {"cap": 10000000000},
                    "throttling": {"cap": 8000000000, "rate": "128k"},
                },
            ),
            "voice": incoming_data.get(
                "voice",
                {
                    "sip": {
                        "realm": "ims.mnc001.mcc370.3gppnetwork.org",
                        "username": f"user_{clean_mdn[-6:]}",
                        "password": "secretpassword",
                    }
                },
            ),
        }

    # =========================================================================
    # RAMA B: DISPOSITIVOS NO-MÓVILES (SIP, Softphones, Teléfonos de Escritorio)
    # =========================================================================
    else:
        print(f"[Device Router] Procesando dispositivo NO-MÓVIL de tipo '{device_type}'")
        # Pasa la carga útil intacta tal cual viene de Monster UI para no romper las claves nativas de SIP
        device_payload = incoming_data.copy()

    # =========================================================================
    # REENVÍO/PERSISTENCIA EN KAZOO REAL
    # =========================================================================
    created_device_data = None
    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as client:
            resp = await client.put(
                f"{KAZOO_REAL_API}/v2/accounts/{account_id}/devices",
                json={"data": device_payload},
                headers=headers,
            )
            if resp.status_code in [200, 201]:
                created_device_data = resp.json().get("data", device_payload)
            else:
                print(f"[Kazoo API Error {resp.status_code}]: {resp.text}")
    except Exception as e:
        print(f"[Proxy PUT Fallback] No se pudo conectar a Kazoo Real: {e}")

    if not created_device_data:
        device_payload["id"] = device_id
        created_device_data = device_payload

    real_device_id = created_device_data.get("id", device_id)
    devices_db[real_device_id] = created_device_data

    return {"status": "success", "data": created_device_data}

@app.put("/v2/accounts/{account_id}/callflows")
@app.post("/v2/accounts/{account_id}/callflows")
@app.put("/accounts/{account_id}/callflows")
@app.post("/accounts/{account_id}/callflows")
async def create_callflow(account_id: str, request: Request, payload: dict = Body(...)):
    headers = {
        k: v for k, v in request.headers.items()
        if k.lower() in ["x-auth-token", "authorization", "content-type"]
    }

    # Extraer los datos enviados por la UI
    cf_data = payload.get("data", payload) if "data" in payload else payload
    cf_id = cf_data.get("id") or f"cf_{int(time.time())}"
    cf_data["id"] = cf_id

    created_cf = None

    # Intentar enviar a Kazoo Real con un timeout explícito
    try:
        async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
            resp = await client.put(
                f"{KAZOO_REAL_API}/v2/accounts/{account_id}/callflows",
                json={"data": cf_data},
                headers=headers
            )
            if resp.status_code in [200, 201]:
                created_cf = resp.json().get("data", cf_data)
    except httpx.HTTPError as e:
        print(f"[Callflow Proxy Timeout/Error]: {e}. Usando fallback local.")

    # Fallback si Kazoo Real tardó en responder (ReadTimeout) o dio error
    if not created_cf:
        created_cf = cf_data

    callflows_db.append(created_cf)
    return {"status": "success", "data": created_cf}



@app.get("/accounts/{account_id}/devices/{device_id}")
@app.get("/v2/accounts/{account_id}/devices/{device_id}")
async def get_device(account_id: str, device_id: str):
    device = devices_db.get(device_id)
    if not device:
        return Response(status_code=404, content='{"status": "error", "message": "Device Not Found"}')
    return {"status": "success", "data": device}

@app.post("/v2/accounts/{account_id}/devices/{device_id}")
@app.patch("/v2/accounts/{account_id}/devices/{device_id}")
@app.post("/accounts/{account_id}/devices/{device_id}")
async def update_device(account_id: str, device_id: str, payload: dict = Body(...)):
    device = devices_db.get(device_id, {})
    device.update(payload)
    device["id"] = device_id
    devices_db[device_id] = device
    return {"status": "success", "data": device}

@app.get("/v2/accounts/{account_id}/devices/{device_id}/usage")
async def get_device_usage(account_id: str, device_id: str):
    return {
        "status": "success",
        "data": {
            "hourly": [
                {"timestamp": 1727220000, "usage": 150000000},
                {"timestamp": 1727223600, "usage": 320000000},
                {"timestamp": 1727227200, "usage": 85000000}
            ]
        }
    }

@app.get("/v2/devices/{device_id}/validity")
async def get_device_validity(device_id: str, _: Optional[str] = Query(None)):
    return {
        "status": "success",
        "data": {
            "valid": True,
            "device_id": device_id,
            "message": "Device is valid and available for activation"
        }
    }


# -------------------------------------------------------------------
# ENDPOINTS AUXILIARES Y KAZOO CORE
# -------------------------------------------------------------------
@app.get("/locality/coverage/{postal_code}")
async def check_coverage(postal_code: str):
    return {
        "status": "success",
        "data": {"5g": "excellent", "lte": "good", "3g": "fair"}
    }

@app.get("/accounts/{account_id}/ports/in")
async def list_porting(account_id: str):
    return {"status": "success", "data": ports_db}

@app.get("/ports/{mdn}/validity")
async def validate_porting(mdn: str, carrier: str = "sprint"):
    return {"status": "success", "data": {"valid": True, "mdn": mdn}}

@app.get("/v2/accounts/{account_id}/users")
async def list_users(account_id: str):
    return {"status": "success", "data": users_db}

@app.get("/v2/accounts/{account_id}/vmboxes")
async def list_vmboxes(account_id: str):
    return {"status": "success", "data": voicemail_boxes_db}

@app.get("/v2/accounts/{account_id}/callflows")
async def list_callflows(account_id: str):
    return {"status": "success", "data": callflows_db}

@app.get("/v2/accounts/{account_id}/callflows/search")
async def search_callflows(account_id: str, value: str = Query(...)):
    matched = [cf for cf in callflows_db if value in cf.get("numbers", [])]
    return {"status": "success", "data": matched}

@app.post("/v2/accounts/{account_id}/callflows")
async def create_callflow(account_id: str, request: Request):
    body = await request.json()
    new_cf = body.get("data", {})
    new_cf["id"] = f"cf_{int(time.time())}"
    callflows_db.append(new_cf)
    return {"status": "success", "data": new_cf}

# Endpoint para inspeccionar el estado del pool de DIDs
@app.get("/v2/accounts/{account_id}/phone_pool")
async def get_phone_pool():
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM phone_pool")
        rows = [dict(r) for r in cursor.fetchall()]
    return {"status": "success", "data": rows}

# -------------------------------------------------------------------
# MIDDLEWARE MAPS GEOCODING MOCK
# -------------------------------------------------------------------
MAPS_GEOCODE_MOCK_DATA = {
    "results": [
        {
            "address_components": [
                {"long_name": "11519", "short_name": "11519", "types": ["postal_code"]},
                {"long_name": "Santo Domingo", "short_name": "SD", "types": ["locality"]},
                {"long_name": "Dominican Republic", "short_name": "DO", "types": ["country"]}
            ],
            "formatted_address": "Santo Domingo 11519, Dominican Republic",
            "geometry": {"location": {"lat": 18.4861, "lng": -69.9312}},
            "place_id": "mock_place_id",
            "types": ["postal_code"]
        }
    ],
    "status": "OK"
}

@app.middleware("http")
async def maps_interceptor(request: Request, call_next):
    raw_path = request.url.path.rstrip("/")
    if "/maps/api/geocode" in raw_path:
        return JSONResponse(
            status_code=200,
            content=MAPS_GEOCODE_MOCK_DATA,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    return await call_next(request)

