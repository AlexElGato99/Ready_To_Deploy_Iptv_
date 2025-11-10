# Ready To Deploy IPTV Server

A production-ready IPTV streaming server with M3U playlist support and EPG (Electronic Program Guide) functionality.

## Features

- 📺 M3U Playlist Generation
- 📋 Electronic Program Guide (EPG) Support
- 🐳 Docker & Docker Compose Ready
- 🔄 RESTful API
- 🏥 Health Check Endpoint
- ⚡ Fast and Lightweight
- 🔧 Easy Configuration

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/AlexElGato99/Ready_To_Deploy_Iptv_.git
cd Ready_To_Deploy_Iptv_
```

2. Start the server:
```bash
docker-compose up -d
```

3. Access your IPTV playlist:
```
http://localhost:8080/playlist.m3u
```

### Using Docker

```bash
docker build -t iptv-server .
docker run -d -p 8080:8080 -v $(pwd)/config:/app/config:ro iptv-server
```

### Manual Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Configuration

### Channels Configuration

Edit `config/channels.json` to configure your channels:

```json
[
  {
    "id": "channel1",
    "name": "Channel Name",
    "logo": "https://example.com/logo.png",
    "group": "Entertainment",
    "url": "http://example.com/stream.m3u8"
  }
]
```

### EPG Configuration

Edit `config/epg.json` to configure program schedules:

```json
{
  "programs": [
    {
      "channel": "channel1",
      "start": "2025-11-10T08:00:00Z",
      "end": "2025-11-10T09:00:00Z",
      "title": "Program Title",
      "description": "Program description"
    }
  ]
}
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=8080
NODE_ENV=production
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/playlist.m3u` | GET | Download M3U playlist |
| `/api/channels` | GET | Get channels list (JSON) |
| `/api/epg` | GET | Get EPG data (JSON) |
| `/health` | GET | Health check endpoint |

## Usage Examples

### Get Playlist
```bash
curl http://localhost:8080/playlist.m3u > playlist.m3u
```

### Get Channels (JSON)
```bash
curl http://localhost:8080/api/channels
```

### Get EPG Data
```bash
curl http://localhost:8080/api/epg
```

### Health Check
```bash
curl http://localhost:8080/health
```

## Deployment

### Docker Compose Production Deployment

1. Update `config/channels.json` with your actual channels
2. Update `config/epg.json` with your EPG data
3. Run with Docker Compose:
```bash
docker-compose up -d
```

### Kubernetes Deployment

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iptv-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: iptv-server
  template:
    metadata:
      labels:
        app: iptv-server
    spec:
      containers:
      - name: iptv-server
        image: iptv-server:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: iptv-config
```

## Monitoring

The server includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T00:00:00.000Z"
}
```

Docker health checks are configured automatically in both Dockerfile and docker-compose.yml.

## Scaling

The application is stateless and can be easily scaled horizontally:

```bash
docker-compose up -d --scale iptv=3
```

## Troubleshooting

### Port Already in Use
Change the port in `.env` or docker-compose.yml:
```yaml
ports:
  - "8081:8080"
```

### Channels Not Loading
- Verify `config/channels.json` exists and is valid JSON
- Check file permissions
- Review Docker volume mounts

### Health Check Failing
- Ensure the application is fully started
- Check container logs: `docker-compose logs iptv`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
