import logging
import json
import httpx
import pymongo
from pymongo import MongoClient
from bson.int64 import Int64
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, model_validator
from typing import Optional, Any, Dict

logger = logging.getLogger("kazoo-mobile-webhook")
app = FastAPI()

# -------------------------------------------------------------------
# CONFIGURACIÓN DE KAZOO CROSSBAR & MONGODB
# -------------------------------------------------------------------
KAZOO_API_URL = "https://portal.example.com:8443/v2"  # Ajustar a la URL de tu Crossbar
KAZOO_API_KEY = ""                     # Reemplazar con tu API Key de Kazoo

mongo_client = MongoClient("mongodb://127.0.0.1:27017/")
db = mongo_client["open5gs"]
subscribers_col = db["subscribers"]
profiles_col = db["profiles"]

PYHSS_BASE_URL = "http://localhost:8080"
PYHSS_HEADERS = {"Content-Type": "application/json"}


# -------------------------------------------------------------------
# KAZOO CROSSBAR AUTH & DEVICE LOOKUP
# -------------------------------------------------------------------
async def get_kazoo_auth_token(client: httpx.AsyncClient) -> Optional[str]:
    """Obtiene el token dinámico X-Auth-Token de Kazoo mediante API Key."""
    auth_url = f"{KAZOO_API_URL}/api_auth"
    payload = {"data": {"api_key": KAZOO_API_KEY}}

    try:
        response = await client.put(auth_url, json=payload, timeout=10.0)
        if response.status_code == 404:
            auth_url = f"{KAZOO_API_URL}/api_auth"
            response = await client.post(auth_url, json=payload, timeout=10.0)

        if response.status_code in (200, 201):
            token = response.json().get("auth_token")
            if token:
                logger.info("[Kazoo Auth] Token de sesión obtenido exitosamente.")
                return token
        logger.error(f"[Kazoo Auth ERROR] Status {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"[Kazoo Auth EXCEPTION] Error al conectar con Kazoo: {e}")
    return None


async def fetch_kazoo_device_data(account_id: str, device_id: str) -> Dict[str, Any]:
    """Consulta los detalles completos del dispositivo en Kazoo Crossbar."""
    async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
        auth_token = await get_kazoo_auth_token(client)
        if not auth_token:
            return {}

        device_url = f"{KAZOO_API_URL}/accounts/{account_id}/devices/{device_id}"
        headers = {"X-Auth-Token": auth_token, "Content-Type": "application/json"}

        try:
            res = await client.get(device_url, headers=headers)
            if res.status_code == 200:
                logger.info(f"[Kazoo API] Detalles obtenidos para el dispositivo {device_id}")
                return res.json().get("data", {})
            else:
                logger.error(f"[Kazoo API ERROR] Status {res.status_code} al consultar {device_id}: {res.text}")
        except Exception as e:
            logger.error(f"[Kazoo API EXCEPTION] Fallo al consultar dispositivo {device_id}: {e}")
    return {}


# -------------------------------------------------------------------
# OPEN5GS MONGODB PROVISIONING (PERFIL EXISTENTE)
# -------------------------------------------------------------------
def save_open5gs_subscriber(imsi: str, msisdn: str, title: str = "profile1") -> bool:
    clean_imsi = str(imsi).replace("+", "").strip()
    clean_mdn = str(msisdn).replace("+", "").strip()

    # 1. Intentar buscar por campo 'name' o 'profile_name'
    stored_profile = profiles_col.find_one(
        {"$or": [{"name": title}, {"title": title}]},
        {"_id": 0, "name": 0, "title": 0}
    )

    # 2. Fallback: Si no tiene campo 'name', tomar el PRIMER documento que exista en la colección 'profiles'
    if not stored_profile:
        stored_profile = profiles_col.find_one({}, {"_id": 0, "name": 0, "title": 0})

    # 3. Fallback secundario: Buscar un suscriptor modelo en 'subscribers'
    if not stored_profile:
        stored_profile = subscribers_col.find_one(
            {"imsi": "001010000000000"},
            {"_id": 0, "imsi": 0, "msisdn": 0, "security": 0}
        )

    if not stored_profile:
        logger.error(f"[Open5GS MongoDB] No se encontró ningún perfil en la colección 'profiles' ni en plantilla base.")
        return False

    logger.info(f"[Open5GS MongoDB] Perfil base extraído correctamente de MongoDB.")

    # 4. Asignar datos del suscriptor
    ue_data = {
        "imsi": clean_imsi,
        "msisdn": [clean_mdn] if clean_mdn else []
    }

    full_doc = {**stored_profile, **ue_data}

    try:
        subscribers_col.update_one(
            {"imsi": clean_imsi},
            {"$set": full_doc},
            upsert=True
        )
        logger.info(f"[Open5GS MongoDB] Suscriptor {clean_imsi} ({clean_mdn}) asignado correctamente con el perfil.")
        return True
    except Exception as e:
        logger.error(f"[Open5GS MongoDB ERROR] Error al guardar {clean_imsi}: {e}")
        return False


# -------------------------------------------------------------------
# PYHSS PROVISIONING (PUT CON FALLBACK PATCH)
# -------------------------------------------------------------------
async def provision_pyhss(imsi: str, msisdn: str):
    clean_imsi = str(imsi).replace("+", "").strip()
    clean_mdn = str(msisdn).replace("+", "").strip()

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        # 1. Subscriber
        sub_base_url = f"{PYHSS_BASE_URL}/subscriber/"
        sub_patch_url = f"{PYHSS_BASE_URL}/subscriber/{clean_imsi}"
        sub_payload = {
            "imsi": clean_imsi,
            "enabled": True,
            "auc_id": 1,
            "default_apn": 1,
            "apn_list": "1,2",
            "msisdn": clean_mdn,
            "ue_ambr_dl": 0,
            "ue_ambr_ul": 0
        }

        try:
            res_sub = await client.put(sub_base_url, json=sub_payload, headers=PYHSS_HEADERS)
            if res_sub.status_code in (400, 409, 422, 500):
                res_sub = await client.patch(sub_patch_url, json=sub_payload, headers=PYHSS_HEADERS)
            logger.info(f"[pyHSS - Subscriber] Status {res_sub.status_code} para {clean_imsi}")
        except Exception as e:
            logger.error(f"[pyHSS - Subscriber ERROR] {e}")

        # 2. IMS Subscriber
        ims_base_url = f"{PYHSS_BASE_URL}/ims_subscriber/"
        ims_patch_url = f"{PYHSS_BASE_URL}/ims_subscriber/{clean_imsi}"
        ims_payload = {
            "imsi": clean_imsi,
            "msisdn": clean_mdn,
            "sh_profile": "string",
            "scscf_peer": "scscf.ims.mnc001.mcc001.3gppnetwork.org",
            "msisdn_list": f"[\"{clean_mdn}\"]",
            "ifc_path": "default_ifc.xml",
            "scscf": "sip:scscf.ims.mnc001.mcc001.3gppnetwork.org:6060",
            "scscf_realm": "ims.mnc001.mcc001.3gppnetwork.org"
        }

        try:
            res_ims = await client.put(ims_base_url, json=ims_payload, headers=PYHSS_HEADERS)
            if res_ims.status_code in (400, 409, 422, 500):
                res_ims = await client.patch(ims_patch_url, json=ims_payload, headers=PYHSS_HEADERS)
            logger.info(f"[pyHSS - IMS Subscriber] Status {res_ims.status_code} para {clean_imsi}")
        except Exception as e:
            logger.error(f"[pyHSS - IMS Subscriber ERROR] {e}")


# -------------------------------------------------------------------
# ENDPOINT PRINCIPAL DEL WEBHOOK
# -------------------------------------------------------------------
@app.post("/webhook/kazoo/mobile")
async def kazoo_mobile_webhook_mongodb(request: Request):
    try:
        raw_body = await request.json()
        logger.info(f"[Webhook Incoming Payload]: {raw_body}")
    except Exception as e:
        logger.error(f"[Webhook Error] Payload JSON inválido: {e}")
        raise HTTPException(status_code=400, detail="JSON inválido")

    # Extraer identificadores del webhook
    account_id = raw_body.get("account_id")
    device_id = raw_body.get("id") or raw_body.get("doc_id")

    imsi = raw_body.get("imsi")
    msisdn = raw_body.get("msisdn") or raw_body.get("mdn")

    # Si el webhook no trae directo el msisdn/imsi (caso típico de Kazoo doc_edited/doc_created)
    if account_id and device_id and (not imsi or not msisdn):
        logger.info(f"[Kazoo GET] Consultando detalles en Crossbar para account={account_id}, device={device_id}")
        device_data = await fetch_kazoo_device_data(account_id, device_id)

        # El device_id en Kazoo Mobile corresponde al IMSI
        imsi = imsi or device_data.get("imsi") or device_id

        mobile_obj = device_data.get("mobile", {}) or device_data.get("sim", {})
        msisdn = msisdn or device_data.get("msisdn") or device_data.get("mdn") or mobile_obj.get("mdn") or mobile_obj.get("msisdn")

    if not imsi or not msisdn:
        logger.error(f"[Webhook 400] Imposible obtener IMSI o MSISDN para el dispositivo {device_id}")
        raise HTTPException(
            status_code=400,
            detail="No se pudo resolver IMSI/MSISDN desde el webhook ni desde Kazoo Crossbar API."
        )

    clean_imsi = str(imsi).replace("+", "").strip()
    clean_msisdn = str(msisdn).replace("+", "").strip()

    # Executar los dos aprovisionamientos
    open5gs_ok = save_open5gs_subscriber(imsi=clean_imsi, msisdn=clean_msisdn, title="profile1")
    await provision_pyhss(imsi=clean_imsi, msisdn=clean_msisdn)

    return {
        "status": "success",
        "imsi": clean_imsi,
        "msisdn": clean_msisdn,
        "open5gs": "provisioned" if open5gs_ok else "failed"
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
