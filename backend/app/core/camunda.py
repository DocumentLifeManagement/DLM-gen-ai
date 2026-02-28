import os
import logging
from pyzeebe import ZeebeClient, ZeebeWorker, create_insecure_channel, create_camunda_cloud_channel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

ZEEBE_ADDRESS = os.getenv("ZEEBE_ADDRESS")
ZEEBE_CLIENT_ID = os.getenv("ZEEBE_CLIENT_ID")
ZEEBE_CLIENT_SECRET = os.getenv("ZEEBE_CLIENT_SECRET")

def get_zeebe_channel():
    if ZEEBE_CLIENT_ID and ZEEBE_CLIENT_SECRET and ZEEBE_ADDRESS:
        # Expected ZEEBE_ADDRESS format: cluster-id.region.zeebe.camunda.io:443
        try:
            # Extract cluster_id and region from address
            parts = ZEEBE_ADDRESS.split('.')
            cluster_id = parts[0]
            region = parts[1]
            return create_camunda_cloud_channel(
                client_id=ZEEBE_CLIENT_ID,
                client_secret=ZEEBE_CLIENT_SECRET,
                cluster_id=cluster_id,
                region=region
            )
        except Exception as e:
            logger.error(f"Error parsing ZEEBE_ADDRESS for Camunda Cloud: {e}")
            # Fallback to insecure if parsing fails
            return create_insecure_channel(grpc_address=ZEEBE_ADDRESS)
    elif ZEEBE_ADDRESS:
        return create_insecure_channel(grpc_address=ZEEBE_ADDRESS)
    else:
        logger.warning("No ZEEBE_ADDRESS found, Zeebe channel not created")
        return None

channel = get_zeebe_channel()

if channel:
    zeebe_client = ZeebeClient(channel)
    zeebe_worker = ZeebeWorker(channel)
else:
    zeebe_client = None
    zeebe_worker = None
