# Deployment Guide - SIGIZI

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              Vercel (CDN)               │
                    │         Frontend Portal (SSR)           │
                    │         https://sigizi.vercel.app       │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Railway / Render                           │
│                    Backend API (NestJS)                             │
│                    https://sigizi-api.railway.app                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Auth SSO   │  │   Supplier   │  │    Batch     │             │
│  │   Module     │  │   Module     │  │    Module    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Complaint   │  │   Reports    │  │   Market     │             │
│  │   Module     │  │   Module     │  │   Analytics  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase / Neon (PostgreSQL)                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    Users     │  │   Suppliers  │  │    Batches   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Complaints  │  │    Orders    │  │ Beneficiaries│             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Environment Variables

### Backend (Railway/Render)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/sigizi"

# JWT
JWT_SECRET="your-production-secret"
JWT_EXPIRES_IN="7d"

# SSO BGN
SSO_BGN_CLIENT_ID="production-client-id"
SSO_BGN_CLIENT_SECRET="production-client-secret"
SSO_BGN_REDIRECT_URI="https://sigizi-api.railway.app/api/auth/callback"

# CORS
CORS_ORIGINS="https://sigizi.vercel.app,http://localhost:3000"

# PORT ( Railway auto-assigns)
PORT=3001
```

### Frontend (Vercel)

```env
# API URL
NEXT_PUBLIC_API_URL="https://sigizi-api.railway.app"

# Portal URL
NEXT_PUBLIC_PORTAL_URL="https://sigizi.vercel.app"
```

## Deployment Steps

### 1. Database (Supabase/Neon)

```bash
# Create new project on Supabase or Neon
# Copy the connection string

# Run migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

### 2. Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL plugin
railway add --plugin postgresql

# Set environment variables
railway variables set JWT_SECRET="your-secret"
railway variables set SSO_BGN_CLIENT_ID="your-client-id"
railway variables set SSO_BGN_CLIENT_SECRET="your-client-secret"
railway variables set SSO_BGN_REDIRECT_URI="https://your-api.railway.app/api/auth/callback"
railway variables set CORS_ORIGINS="https://your-portal.vercel.app"

# Deploy
railway up

# Run migrations
railway run pnpm prisma migrate deploy
```

### 3. Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Create project
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-api.railway.app

vercel env add NEXT_PUBLIC_PORTAL_URL
# Enter: https://your-portal.vercel.app

# Deploy
vercel --prod
```

## Domain Setup (Optional)

### Custom Domain for Backend

```bash
# Railway
railway domain add api.sigizi.com
```

### Custom Domain for Frontend

```bash
# Vercel
vercel domains add sigizi.com
```

### DNS Configuration

```
Type    Name    Value
A       @       76.76.21.21        # Vercel
CNAME   api     your-api.up.railway.app  # Railway
```

## Monitoring

### Health Check Endpoint

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-09T00:00:00Z",
  "version": "0.1.0",
  "database": "connected"
}
```

### Logs

```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

## Backup & Recovery

### Database Backup (Supabase)

- Automatic daily backups (7 days retention)
- Manual backup via Supabase dashboard

### Database Backup (Manual)

```bash
# Export
pg_dump $DATABASE_URL > backup.sql

# Import
psql $DATABASE_URL < backup.sql
```

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] CORS_ORIGINS only includes production domains
- [ ] Database connection uses SSL
- [ ] SSO credentials are secure
- [ ] No secrets in client-side code
- [ ] Rate limiting enabled on API
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (Next.js handles this)

## Cost Estimation (Monthly)

| Service | Free Tier | Paid (Est.) |
|---------|-----------|-------------|
| Vercel | 100GB bandwidth | $20/mo |
| Railway | $5 credit | $5-20/mo |
| Supabase | 500MB DB | $25/mo |
| **Total** | **$0** | **$45-65/mo** |

## Rollback Procedure

### Backend

```bash
# Railway - rollback to previous deployment
railway rollback

# Or redeploy specific commit
railway up --commit abc123
```

### Frontend

```bash
# Vercel - promote previous deployment
vercel promote <deployment-url>
```

### Database

```bash
# If schema changed, create a migration to revert
pnpm prisma migrate dev --create-only revert_changes
pnpm prisma migrate deploy
```
