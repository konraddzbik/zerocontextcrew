FROM python:3.12-slim

WORKDIR /app

# Install system deps needed by Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev libpng-dev libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create the audio output directory
RUN mkdir -p generated_audio

EXPOSE 8000

CMD ["python", "main.py"]
