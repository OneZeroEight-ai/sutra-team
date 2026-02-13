FROM python:3.11-slim

WORKDIR /app

# System dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Silero VAD model at build time (avoids runtime download)
RUN python -c "from livekit.plugins.silero import VAD; VAD.load()"

COPY . .

EXPOSE 8080

RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
