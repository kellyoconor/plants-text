# 🚀 PlantTexts Deployment Guide

## Overview

This guide covers deploying PlantTexts to production using Railway (recommended) or other hosting platforms.

## 🏗️ Architecture

```
Frontend (React) → Backend (FastAPI) → PostgreSQL
                      ↓
                   Redis ← Celery Workers
                      ↓
                   Twilio SMS
```

## 🚂 Railway Deployment (Recommended)

Railway provides the easiest deployment with automatic PostgreSQL and Redis.

### 1. Prerequisites

- GitHub account with your PlantTexts repository
- Railway account (free tier available)
- OpenAI API key
- Twilio account (for SMS)

### 2. Backend Deployment

1. **Connect to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   ```

2. **Create New Project**
   ```bash
   railway new planttexts-backend
   cd planttexts-backend
   ```

3. **Add Services**
   ```bash
   # Add PostgreSQL
   railway add postgresql
   
   # Add Redis
   railway add redis
   ```

4. **Deploy Backend**
   ```bash
   # Link your GitHub repo
   railway link
   
   # Deploy from backend folder
   railway up --service backend
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=sk-your-key-here
   railway variables set TWILIO_ACCOUNT_SID=your-sid
   railway variables set TWILIO_AUTH_TOKEN=your-token
   railway variables set TWILIO_PHONE_NUMBER=+1234567890
   railway variables set SECRET_KEY=your-super-secret-key
   railway variables set ENVIRONMENT=production
   railway variables set DEBUG=false
   ```

### 3. Frontend Deployment

1. **Create Frontend Service**
   ```bash
   railway add
   # Select "Empty Service"
   # Name it "frontend"
   ```

2. **Configure Build**
   - Set build command: `cd frontend && npm run build`
   - Set start command: `cd frontend && npx serve -s build -l $PORT`

3. **Set Environment Variables**
   ```bash
   railway variables set REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

### 4. Custom Domain (Optional)

1. **Add Domain in Railway Dashboard**
   - Go to your frontend service
   - Click "Settings" → "Domains"
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record pointing to Railway

## 🐳 Docker Deployment

### Local Testing

```bash
# Copy environment file
cp env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker

```bash
# Build images
docker build -t planttexts-backend ./backend
docker build -t planttexts-frontend ./frontend

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379/0

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
SECRET_KEY=your-super-secret-key-change-this
```

### Optional Variables

```bash
# App Configuration
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=["https://yourdomain.com"]

# Braintrust (for prompt management)
BRAINTRUST_API_KEY=your-braintrust-key
```

## 📱 Twilio SMS Setup

### 1. Create Twilio Account
- Sign up at [twilio.com](https://twilio.com)
- Get a phone number
- Note your Account SID and Auth Token

### 2. Configure Webhooks
- In Twilio Console, go to Phone Numbers
- Set webhook URL: `https://your-backend-url.railway.app/api/v1/sms/webhook`
- Set HTTP method to POST

### 3. Test SMS
```bash
# Send test message via API
curl -X POST https://your-backend-url.railway.app/api/v1/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Test from PlantTexts!"}'
```

## 🗄️ Database Migration

### From SQLite to PostgreSQL

1. **Export SQLite Data**
   ```bash
   cd backend
   python -c "
   from app.core.database import SessionLocal
   from app.models.plants import *
   # Export logic here
   "
   ```

2. **Import to PostgreSQL**
   ```bash
   # Run Alembic migrations
   alembic upgrade head
   
   # Seed with plant data
   python seed_database.py
   ```

## 📊 Monitoring & Logging

### Health Checks

- Backend: `https://your-backend-url.railway.app/health`
- Frontend: `https://your-frontend-url.railway.app/health`

### Logging

Railway automatically captures logs. View them in the dashboard or CLI:

```bash
railway logs --service backend
railway logs --service frontend
```

### Error Monitoring

Consider adding:
- Sentry for error tracking
- Uptime monitoring (UptimeRobot, etc.)
- Performance monitoring (New Relic, etc.)

## 🔒 Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=false in production
- [ ] Configure CORS_ORIGINS properly
- [ ] Use HTTPS everywhere
- [ ] Secure database credentials
- [ ] Enable Railway's built-in security features
- [ ] Regular dependency updates

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify PostgreSQL service is running
   - Check network connectivity

2. **Redis Connection Errors**
   - Verify REDIS_URL format
   - Check Redis service status
   - Ensure Celery workers can connect

3. **SMS Not Working**
   - Verify Twilio credentials
   - Check webhook URL is accessible
   - Test with Twilio Console

4. **Frontend Not Loading**
   - Check REACT_APP_API_URL is correct
   - Verify CORS configuration
   - Check network requests in browser dev tools

### Getting Help

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Twilio Support: [support.twilio.com](https://support.twilio.com)
- OpenAI Support: [help.openai.com](https://help.openai.com)

## 📈 Scaling Considerations

### Performance Optimization

- Enable Redis caching for API responses
- Use CDN for frontend static assets
- Optimize database queries
- Scale Celery workers based on load

### Cost Optimization

- Monitor Railway usage
- Optimize Docker image sizes
- Use appropriate service tiers
- Monitor OpenAI API usage

---

## 🎯 Next Steps After Deployment

1. **Test End-to-End Flow**
   - Complete user onboarding
   - Add plants and test chat
   - Verify SMS delivery and responses

2. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Track user engagement

3. **Iterate and Improve**
   - Gather user feedback
   - Fix bugs and edge cases
   - Add new features based on usage

**Congratulations! Your PlantTexts MVP is now live! 🌱📱✨**
