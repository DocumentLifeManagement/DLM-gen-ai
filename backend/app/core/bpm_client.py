import os
import logging
from pyzeebe import ZeebeClient, ZeebeWorker, create_camunda_cloud_channel, create_insecure_channel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

def get_zeebe_channel():
    """Helper to parse env and create the appropriate channel."""
    address = os.getenv("ZEEBE_ADDRESS")
    client_id = os.getenv("ZEEBE_CLIENT_ID")
    client_secret = os.getenv("ZEEBE_CLIENT_SECRET")

    if not address:
        logger.warning("No ZEEBE_ADDRESS found")
        return None

    if client_id and client_secret:
        try:
            # Expected format: cluster-id.region.zeebe.camunda.io:443
            parts = address.split('.')
            cluster_id = parts[0]
            region = parts[1]
            return create_camunda_cloud_channel(
                client_id=client_id,
                client_secret=client_secret,
                cluster_id=cluster_id,
                region=region
            )
        except Exception as e:
            logger.error(f"Error parsing ZEEBE_ADDRESS: {e}")
            return create_insecure_channel(grpc_address=address)
    
    return create_insecure_channel(grpc_address=address)

def get_zeebe_client():
    """Returns a client instance. Must be called inside an async loop."""
    channel = get_zeebe_channel()
    return ZeebeClient(channel) if channel else None

def get_zeebe_worker():
    """Returns a worker instance. Must be called inside an async loop."""
    channel = get_zeebe_channel()
    return ZeebeWorker(channel) if channel else None