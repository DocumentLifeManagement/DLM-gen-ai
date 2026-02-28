import asyncio
import os
import sys
import logging
import traceback

# Ensure project root is in path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from app.core.bpm_client import get_zeebe_client

logging.basicConfig(level=logging.INFO)

async def deploy():
    # Initialize the client inside the active event loop
    client = get_zeebe_client()
    
    if not client:
        print("❌ Error: Zeebe client could not be initialized. Check .env variables.")
        return

    bpmn_path = os.path.abspath(os.path.join(PROJECT_ROOT, "workflows", "BPMN_workflow_1.bpmn"))
    print(f"Deploying: {bpmn_path}")
    
    try:
        await client.deploy_resource(bpmn_path)
        print("\n🚀 DEPLOYMENT SUCCESSFUL! Check 'Operate' in Camunda Console.")
    except Exception as e:
        print("\n❌ DEPLOYMENT FAILED!")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(deploy())