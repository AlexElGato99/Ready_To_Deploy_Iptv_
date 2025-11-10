# Deployment Guide

This guide provides comprehensive instructions for deploying the IPTV server in various environments.

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 18+ (for manual deployment)
- Git

## Quick Deployment with Docker Compose

This is the recommended method for production deployment:

```bash
# Clone the repository
git clone https://github.com/AlexElGato99/Ready_To_Deploy_Iptv_.git
cd Ready_To_Deploy_Iptv_

# Configure your channels (edit config/channels.json)
# Configure your EPG data (edit config/epg.json)

# Start the service
docker-compose up -d

# Check the logs
docker-compose logs -f iptv

# Access the service
curl http://localhost:8080/playlist.m3u
```

## Production Deployment Options

### 1. Docker Compose with Custom Port

Edit `docker-compose.yml` or create a `.env` file:

```bash
echo "PORT=8081" > .env
docker-compose up -d
```

### 2. Docker with Volume Mounts

```bash
docker build -t iptv-server .
docker run -d \
  --name iptv-server \
  -p 8080:8080 \
  -v $(pwd)/config:/app/config:ro \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  iptv-server
```

### 3. Kubernetes Deployment

Create a ConfigMap for your channels and EPG:

```bash
kubectl create configmap iptv-config \
  --from-file=channels.json=config/channels.json \
  --from-file=epg.json=config/epg.json
```

Apply the deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iptv-server
  labels:
    app: iptv-server
spec:
  replicas: 3
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
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config
        configMap:
          name: iptv-config
---
apiVersion: v1
kind: Service
metadata:
  name: iptv-server
spec:
  selector:
    app: iptv-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### 4. Cloud Platforms

#### AWS (ECS)

1. Build and push to ECR:
```bash
aws ecr create-repository --repository-name iptv-server
docker build -t iptv-server .
docker tag iptv-server:latest [ECR_URI]/iptv-server:latest
docker push [ECR_URI]/iptv-server:latest
```

2. Create an ECS task definition and service

#### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/[PROJECT-ID]/iptv-server
gcloud run deploy iptv-server \
  --image gcr.io/[PROJECT-ID]/iptv-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Heroku

```bash
heroku create iptv-server-app
heroku container:push web
heroku container:release web
```

## Configuration

### Channel Configuration

Edit `config/channels.json`:

```json
[
  {
    "id": "unique-id",
    "name": "Channel Name",
    "logo": "https://example.com/logo.png",
    "group": "Category",
    "url": "http://stream-url.com/stream.m3u8"
  }
]
```

### EPG Configuration

Edit `config/epg.json`:

```json
{
  "programs": [
    {
      "channel": "channel-id",
      "start": "2025-11-10T08:00:00Z",
      "end": "2025-11-10T09:00:00Z",
      "title": "Program Title",
      "description": "Program description"
    }
  ]
}
```

### Environment Variables

Available environment variables:

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (production/development)

## Security Considerations

### Rate Limiting

The server includes built-in rate limiting (100 requests per 15 minutes per IP). To adjust:

Edit `server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increase limit
});
```

### HTTPS/SSL

For production, always use HTTPS. Options:

1. **Reverse Proxy (Recommended)**:
   - Use Nginx or Traefik with Let's Encrypt
   - Example Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name iptv.example.com;
    
    ssl_certificate /etc/letsencrypt/live/iptv.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iptv.example.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **Cloud Load Balancer**: Use AWS ALB, GCP Load Balancer, etc.

## Monitoring

### Health Checks

The `/health` endpoint provides server status:

```bash
curl http://localhost:8080/health
```

### Logging

View logs:
```bash
# Docker Compose
docker-compose logs -f iptv

# Docker
docker logs -f iptv-server

# Manual
# Check console output
```

### Metrics

Consider adding:
- Prometheus for metrics collection
- Grafana for visualization
- APM tools like New Relic or DataDog

## Scaling

### Horizontal Scaling

The application is stateless and can be scaled horizontally:

```bash
# Docker Compose
docker-compose up -d --scale iptv=3

# Kubernetes
kubectl scale deployment iptv-server --replicas=5
```

### Load Balancing

Use a load balancer to distribute traffic:
- Nginx
- HAProxy
- Cloud load balancers (AWS ALB, GCP LB)

## Backup and Recovery

### Configuration Backup

Regularly backup your configuration:

```bash
tar -czf iptv-config-backup.tar.gz config/
```

### Automated Backups

Set up a cron job:

```bash
0 0 * * * tar -czf /backup/iptv-config-$(date +\%Y\%m\%d).tar.gz /path/to/config/
```

## Troubleshooting

### Server won't start

Check:
1. Port availability: `netstat -tuln | grep 8080`
2. Configuration files are valid JSON
3. Docker/Node.js is properly installed

### Channels not loading

1. Verify `config/channels.json` exists
2. Check JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('config/channels.json'))"`
3. Verify file permissions

### High memory usage

1. Check number of channels
2. Monitor with: `docker stats iptv-server`
3. Consider increasing container memory limits

## Performance Optimization

### Caching

Consider adding Redis for caching:
- Channel lists
- EPG data
- API responses

### CDN

For static assets (logos, etc.), use a CDN:
- CloudFlare
- AWS CloudFront
- Fastly

## Support

For issues and questions:
- Check the [README.md](README.md)
- Review Docker logs
- Check GitHub Issues
