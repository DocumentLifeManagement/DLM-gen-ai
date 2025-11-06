import logging
import os
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging
formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")

# File handler
file_handler = logging.FileHandler(log_dir / "backend.log")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# Configure logger
logger = logging.getLogger("backend")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Prevent duplicate logs when other modules use basicConfig
logger.propagate = False
