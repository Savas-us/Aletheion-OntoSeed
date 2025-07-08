# Deployment Guide

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ with pip
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Savas-us/Aletheion-OntoSeed.git
cd Aletheion-OntoSeed

# Install dependencies
npm install

# Install Python dependencies
pip install pyshacl

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t ontoseed .

# Run container
docker run -p 3000:3000 ontoseed
```

### Docker Compose

```bash
# Start with docker-compose
docker-compose up

# Start with PostgreSQL (optional)
docker-compose --profile postgres up
```

## Cloud Deployment

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
flyctl auth login

# Deploy application
flyctl deploy
```

### Manual Cloud Setup

1. **Build Docker image**:
   ```bash
   docker build -t ontoseed .
   ```

2. **Push to registry**:
   ```bash
   docker tag ontoseed your-registry/ontoseed:latest
   docker push your-registry/ontoseed:latest
   ```

3. **Deploy to cloud provider** using the pushed image

## CI/CD Pipeline

### GitHub Actions

The project includes automated CI/CD via GitHub Actions:

- **Build**: Creates Docker image on every push
- **Test**: Runs smoke tests against built image
- **Deploy**: Deploys to Fly.io on main branch

### Required Secrets

Configure these secrets in your GitHub repository:

- `FLY_API_TOKEN`: Fly.io deployment token

### Workflow Features

- Automated testing with health checks
- Docker image caching for faster builds
- Deployment URL reporting in PR summaries

## Environment Variables

### Production Settings

```bash
NODE_ENV=production
PORT=3000
```

### Optional Configuration

```bash
# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Custom ontology paths
ONTOLOGY_PATH=/custom/ontology/path

# ZKP circuit configuration
PTAU_POWER=16
CIRCUIT_BUILD_PATH=/app/build
```

## Health Checks

### Automated Testing

```bash
# Run smoke tests
./scripts/smoke.sh

# Test specific endpoint
./scripts/smoke.sh https://your-app.fly.dev
```

### Manual Health Check

```bash
# Check application health
curl -f http://localhost:3000/

# Validate API endpoints
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: text/turtle" \
  -d "@example.ttl"
```

## Monitoring

### Application Metrics

- Response time monitoring
- API endpoint health checks
- ZKP proof generation performance
- Database query performance

### Recommended Tools

- **Uptime monitoring**: Pingdom, UptimeRobot
- **Error tracking**: Sentry, Rollbar
- **Performance monitoring**: New Relic, DataDog
- **Log aggregation**: LogDNA, Papertrail

## Security Considerations

### Production Checklist

- [ ] HTTPS enabled with valid certificates
- [ ] Environment variables properly configured
- [ ] Database connections encrypted
- [ ] Regular security updates applied
- [ ] Access logs monitoring enabled
- [ ] Rate limiting configured
- [ ] CORS policies properly set

### ZKP Security

- [ ] PTAU files integrity verified
- [ ] Circuit compilation reproducible
- [ ] Proof generation randomness secure
- [ ] Verification keys protected

## Performance Optimization

### Caching Strategy

- Docker layer caching in CI/CD
- PTAU file caching for ZKP circuits
- npm package caching
- Static asset optimization

### Database Optimization

- SQLite WAL mode for better concurrency
- Regular VACUUM operations
- Index optimization for queries
- Connection pooling if using PostgreSQL

## Troubleshooting

### Common Issues

1. **pyshacl not found**: Install with `pip install pyshacl`
2. **ZKP circuit compilation fails**: Check PTAU file integrity
3. **Port already in use**: Change PORT environment variable
4. **Docker build fails**: Ensure Docker daemon is running

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Verbose Docker build
docker build --no-cache --progress=plain -t ontoseed .
```

### Support

For deployment issues, check:
- [GitHub Issues](https://github.com/Savas-us/Aletheion-OntoSeed/issues)
- [Documentation](https://savas-us.github.io/Aletheion-OntoSeed/)
- [Security Policy](../SECURITY.md)