import os
import requests
import logging

SUPERVISOR_URL = "http://supervisor"
SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN")

logger = logging.getLogger(__name__)

headers = {
    "Authorization": f"Bearer {SUPERVISOR_TOKEN}",
    "Content-Type": "application/json",
}

def get_entity_state(entity_id: str):
    """Gets the state of an entity from Home Assistant."""
    try:
        url = f"{SUPERVISOR_URL}/core/api/states/{entity_id}"
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching state for {entity_id}: {e}")
        return None

def call_service(domain: str, service: str, service_data: dict):
    """Calls a service in Home Assistant."""
    try:
        url = f"{SUPERVISOR_URL}/core/api/services/{domain}/{service}"
        response = requests.post(url, headers=headers, json=service_data, timeout=5)
        response.raise_for_status()
        logger.info(f"Service called: {domain}.{service} with {service_data}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling service {domain}.{service}: {e}")
        return False

def turn_on(entity_id: str):
    domain = entity_id.split('.')[0]
    return call_service(domain, "turn_on", {"entity_id": entity_id})

def turn_off(entity_id: str):
    domain = entity_id.split('.')[0]
    return call_service(domain, "turn_off", {"entity_id": entity_id})

def get_all_entities():
    """Gets all entities from Home Assistant."""
    try:
        url = f"{SUPERVISOR_URL}/core/api/states"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching entities: {e}")
        return None

def check_connection():
    """Simple check to ensure Supervisor is reachable."""
    try:
        url = f"{SUPERVISOR_URL}/core/api/"
        response = requests.get(url, headers=headers, timeout=2)
        return response.status_code == 200
    except:
        return False

