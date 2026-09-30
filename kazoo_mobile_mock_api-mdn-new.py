import random
import httpx
import time
from fastapi import Body, FastAPI, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(redirect_slashes=False)
print("¡La API se está ejecutando aquí!")
# URL base del API real de Kazoo / Crossbar
KAZOO_REAL_API = "http://127.0.0.1:8000"
# -------------------------------------------------------------------
# CONFIGURACIÓN CORS (Permite llamadas desde Monster UI)
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# BASE DE DATOS EN MEMORIA (MOCK DATA)
# -------------------------------------------------------------------
ACCOUNT_ID = "4409b1f0000000000000000000000000"

SPARES_POOL = [
    "+18295550101",
    "+18295550102",
    "+18295550103",
    "+18295550104",
    "+18295550105",
]

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

devices_db = {
    "dev_mob_001": {
        "id": "dev_mob_001",
        "name": "Felipe Ernesto Mateo",
        "device_type": "mobile",
        "enabled": True,
        "mdn": "18292672505",
        "esn": "89014103211118501001",
        "postal_code": "11519",
        "model": {
            "manufacturer": "apple",
            "name": "iphone",
            "number": "15",
        },
        "mobile": {
            "id": "dev_mob_001",
            "mdn": "18292672505",
            "esn": "89014103211118501001",
        },
        "subscription": {
            "mdn": "18292672505",
            "esn": "89014103211118501001",
            "features": ["mms", "tethering"],
            "suspended": False,
        },
        "voice": {
            "sip": {
                "realm": "ims.mnc001.mcc370.3gppnetwork.org",
                "username": "user_mob001",
                "password": "secretpassword",
            }
        },
        "data": {
            "blocking": {"cap": 10000000000},
            "throttling": {"cap": 8000000000, "rate": "128k"},
        },
    }
}

users_db = [
    {
        "id": "usr_001",
        "first_name": "Felipe",
        "last_name": "Mateo",
        "email": "felipe@example.com",
    }
]

voicemail_boxes_db = [
    {"id": "vm_001", "name": "Buzón Principal", "owner_id": "usr_001", "mailbox": "100"}
]

callflows_db = [
    {
        "id": "cf_001",
        "name": "Callflow Móvil +1 (829) 267-2505",
        "numbers": ["18292672505"],
        "type": "mobile",
        "owner_id": "usr_001",
        "flow": {"module": "device", "data": {"id": "dev_mob_001"}},
    }
]

ports_db = []

# -------------------------------------------------------------------
# GENERADORES DE DATOS ALEATORIOS
# -------------------------------------------------------------------
def generate_random_mdn(country_code="1", area_code="809"):
    subscriber = "".join([str(random.randint(0, 9)) for _ in range(7)])
    return f"+{country_code}{area_code}{subscriber}"

def generate_random_esn():
    return "".join([str(random.randint(0, 9)) for _ in range(15)])

# -------------------------------------------------------------------
# ENDPOINTS ACCOUNTS
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

# -------------------------------------------------------------------
# CORRECCIÓN: ENDPOINT ACCOUNTS (Añadido /v2 y soporte para barra final "/")
# -------------------------------------------------------------------
@app.get("/v2/accounts/{account_id}/usage")
@app.get("/v2/accounts/{account_id}/usage/")  # Soporta la barra diagonal final del log
@app.get("/accounts/{account_id}/usage")
async def top_get_account_usage(account_id: str):
    """Suministra el uso total y consumo por línea (MDN)"""
    return {
        "status": "success",
        "data": {
            "total": 3500000000   # ~3.5 GB consumidos
            },
            "total_usage": 150000000
    }

def get_random_mdn() -> str:
    """Genera un MDN aleatorio válido si el pool está vacío."""
    suffix = "".join([str(random.randint(0, 9)) for _ in range(7)])
    return f"+1829{suffix}"


def get_random_mdn() -> str:
    """Genera un MDN aleatorio válido si el pool está vacío."""
    suffix = "".join([str(random.randint(0, 9)) for _ in range(7)])
    return "+1829{suffix}"


# -------------------------------------------------------------------
# ENDPOINTS DEVICES (LISTAR, CONSULTAR Y ACTIVAR)
# -------------------------------------------------------------------
# @app.get("/v2/accounts/{account_id}/devices")
# @app.get("/accounts/{account_id}/devices")
# async def list_devices(
#    account_id: str,
#    filter_device_type: str = None,
#    filter_mobile_mdn: str = Query(None, alias="filter_mobile.mdn")
# ):
#    data_list = list(devices_db.values())
#    if filter_mobile_mdn:
#        data_list = [d for d in data_list if d.get("mdn") == filter_mobile_mdn]
#   if filter_device_type:
#       data_list = [d for d in data_list if d.get("device_type") == filter_device_type]
#   return {"status": "success", "data": data_list}

#@app.post("/v2/accounts/{account_id}/devices")
#@app.put("/v2/accounts/{account_id}/devices")
#@app.post("/accounts/{account_id}/devices/activate")
#@app.put("/accounts/{account_id}/devices")
#async def activate_or_create_device(account_id: str, payload: dict = Body(...)):
#    assigned_mdn = payload.get("mdn") or generate_random_mdn()
#    assigned_esn = payload.get("esn") or generate_random_esn()
    
    # Manejar si el payload trae id (actualización) o crear uno nuevo
#    device_id = payload.get("id") or f"dev_{random.randint(100000, 999999)}"
#    clean_mdn = assigned_mdn.replace("+", "")

#   new_device = {
#       "id": device_id,
#       "name": payload.get("name", "Mobile Device"),
#       "device_type": "mobile",
#       "enabled": True,
#       "mdn": clean_mdn,
#       "esn": assigned_esn,
#       "postal_code": payload.get("postal_code", "11519"),
#       "mobile": {
#           "id": device_id,
#           "mdn": assigned_mdn,
#           "esn": assigned_esn
#       },
#       "subscription": {
#           "mdn": assigned_mdn,
#           "esn": assigned_esn,
#           "features": payload.get("subscription", {}).get("features", ["mms", "tethering"]),
#           "suspended": False
#       },
#       "model": payload.get("model", {"manufacturer": "apple", "name": "iphone", "number": "15"}),
#       "data": payload.get("data", {
#           "blocking": {"cap": 10000000000},
#           "throttling": {"cap": 8000000000, "rate": "128k"}
#       }),
#       "voice": payload.get("voice", {
#           "sip": {
#               "realm": "ims.mnc001.mcc370.3gppnetwork.org",
#               "username": f"user_{random.randint(100, 999)}",
#               "password": "secretpassword"
#           }
#       })
#   }

#   devices_db[device_id] = new_device

    # CRÍTICO: Entregar 'esn' y 'mdn' en la raíz de 'data' para que aparezca en la pantalla final de la UI
    return {
        "status": "success",
        "data": new_device
    }

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
    # Fusionar cambios
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

# -------------------------------------------------------------------
# NUEVO: ENDPOINT DEVICES VALIDITY (Faltaba por completo)
# -------------------------------------------------------------------
@app.get("/v2/devices/{device_id}/validity")
async def get_device_validity(device_id: str, _: str = Query(None)):
    # Simula que el dispositivo (IMEI/ESN) es válido para la plataforma
    return {
        "status": "success",
        "data": {
            "valid": True,
            "device_id": device_id,
            "message": "Device is valid and available for activation"
        }
    }

@app.get("/locality/coverage/{postal_code}")
async def check_coverage(postal_code: str):
    return {
        "status": "success",
        "data": {
            "5g": "excellent",
            "lte": "good",
            "3g": "fair"
        }
    }

@app.get("/accounts/{account_id}/ports/in")
@app.get("/v2/accounts/{account_id}/ports/in")
async def list_porting(account_id: str):
    return {"status": "success", "data": ports_db}

@app.get("/ports/{mdn}/validity")
async def validate_porting(mdn: str, carrier: str = "sprint"):
    return {
        "status": "success",
        "data": {
            "valid": True,
            "mdn": mdn
        }
    }

# -------------------------------------------------------------------
# ENDPOINTS USERS, VMBOXES, CALLFLOWS (KAZOO CORE)
# -------------------------------------------------------------------
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

# -------------------------------------------------------------------
# MOCK DE GOOGLE MAPS GEOCODING
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
            "geometry": {
                "location": {"lat": 18.4861, "lng": -69.9312}
            },
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

# -------------------------------------------------------------------
# ENDPOINTS LOCALITY COVERAGE (CHECK COVERAGE)
# -------------------------------------------------------------------
@app.options("/locality/coverage/{zip_code}")
@app.options("/v2/locality/coverage/{zip_code}")
@app.options("/accounts/{account_id}/locality/coverage/{zip_code}")
@app.options("/v2/accounts/{account_id}/locality/coverage/{zip_code}")
@app.get("/locality/coverage/{zip_code}")
@app.get("/v2/locality/coverage/{zip_code}")
@app.get("/accounts/{account_id}/locality/coverage/{zip_code}")
@app.get("/v2/accounts/{account_id}/locality/coverage/{zip_code}")
async def get_locality_coverage(zip_code: str, request: Request):
    # Responder 200 OK inmediatamente a las solicitudes Preflight CORS
    if request.method == "OPTIONS":
        return {}

    # Respuesta mock de cobertura que espera la interfaz de Monster UI
    return {
        "status": "success",
        "data": {
            "zip_code": zip_code,
            "coverage": True,
            "networks": [
                {
                    "name": "5G Ultra Wideband",
                    "status": "available",
                    "signal_strength": "excellent",
                },
                {
                    "name": "4G LTE",
                    "status": "available",
                    "signal_strength": "excellent",
                },
            ],
            "locality": "Santo Domingo",
            "state": "SD",
            "coordinates": {"lat": 18.4861, "lng": -69.9312}
        }
    }

# if __name__ == "__main__":
#    import uvicorn
#    uvicorn.run("kazoo_mobile_mock_api:app", host="0.0.0.0", port=5000, reload=True)
