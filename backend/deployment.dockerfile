FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for some python builds if necessary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# 1. Install CPU-only PyTorch first (reduces image size from 3GB+ to under 500MB)
RUN pip install --no-cache-dir torch==2.1.2 --index-url https://download.pytorch.org/whl/cpu

# 2. Remove any hardcoded torch version from requirements.txt to prevent pip from overwriting it
RUN sed -i '/^torch==/d' requirements.txt

# 3. Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use the PORT environment variable assigned by Railway
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]