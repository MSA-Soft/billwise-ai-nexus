# BillWise AI Nexus Deployment Guide

## Overview

This guide covers deploying the BillWise AI Nexus application to production environments.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Domain name and SSL certificate
- Environment variables configured

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# AI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Application Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-domain.com

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the database setup script:
   ```sql
   -- Run Database/complete-database-setup.sql
   ```
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers
5. Configure storage buckets for file uploads

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
npm run test:run
```

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: AWS S3 + CloudFront

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

3. Configure CloudFront distribution

### Option 4: Docker

1. Create Dockerfile:
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Build and run:
   ```bash
   docker build -t billwise-ai-nexus .
   docker run -p 80:80 billwise-ai-nexus
   ```

## Database Migration

### 1. Run Database Setup

Execute the complete database setup script:

```sql
-- Run Database/complete-database-setup.sql
```

### 2. Seed Initial Data

```sql
-- Run Database/seed-data.sql
```

### 3. Configure RLS Policies

Ensure all tables have proper Row Level Security policies:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_statements ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

## Security Configuration

### 1. HTTPS Setup

Ensure your domain has a valid SSL certificate. Most hosting providers handle this automatically.

### 2. CORS Configuration

Configure CORS in your Supabase project:

```sql
-- Allow your domain
INSERT INTO auth.config (key, value) 
VALUES ('cors_origins', 'https://your-domain.com');
```

### 3. Environment Variables Security

- Never commit `.env` files to version control
- Use environment variable management in your hosting platform
- Rotate API keys regularly
- Use different keys for different environments

## Performance Optimization

### 1. CDN Configuration

Configure your CDN to cache static assets:

```
Cache-Control: public, max-age=31536000
```

### 2. Compression

Enable gzip compression for text assets:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 3. Image Optimization

Use optimized images and lazy loading:

```tsx
import { LazyImage } from '@/components/LazyImage';

<LazyImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
/>
```

## Monitoring and Analytics

### 1. Error Tracking

Set up Sentry for error tracking:

```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
});
```

### 2. Performance Monitoring

Configure performance monitoring:

```tsx
import { performanceMonitor } from '@/utils/performance';

// Monitor component render times
performanceMonitor.measure('component-render', () => {
  // Component logic
});
```

### 3. Analytics

Set up Google Analytics:

```tsx
import { analytics } from '@/utils/analytics';

// Track page views
analytics.track('page_view', {
  page: '/dashboard',
  user_id: user.id
});
```

## Backup and Recovery

### 1. Database Backups

Set up automated database backups:

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 2. File Storage Backups

Configure backup for file storage:

```bash
# Backup Supabase storage
supabase storage download --bucket-name files
```

### 3. Disaster Recovery Plan

1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from version control
3. **Data Recovery**: Restore from file storage backups

## Health Checks

### 1. Application Health

Create a health check endpoint:

```tsx
// pages/health.tsx
export default function Health() {
  return (
    <div>
      <h1>Application Status: Healthy</h1>
      <p>Database: Connected</p>
      <p>API: Operational</p>
    </div>
  );
}
```

### 2. Database Health

Monitor database connectivity:

```tsx
import { supabase } from '@/integrations/supabase/client';

const checkDatabaseHealth = async () => {
  try {
    await supabase.from('health_check').select('*').limit(1);
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## Scaling Considerations

### 1. Horizontal Scaling

- Use load balancers for multiple instances
- Implement session storage for state management
- Configure database connection pooling

### 2. Vertical Scaling

- Monitor resource usage
- Scale up server resources as needed
- Optimize database queries

### 3. Caching Strategy

- Implement Redis for session storage
- Use CDN for static assets
- Cache API responses where appropriate

## Maintenance

### 1. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Apply security patches promptly

### 2. Performance Monitoring

- Monitor Core Web Vitals
- Track user experience metrics
- Optimize based on performance data

### 3. Backup Verification

- Test backup restoration regularly
- Verify data integrity
- Document recovery procedures

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version and dependencies
2. **Database Connection**: Verify Supabase credentials
3. **Environment Variables**: Ensure all required variables are set
4. **CORS Issues**: Configure allowed origins in Supabase

### Debug Mode

Enable debug mode for troubleshooting:

```env
VITE_APP_DEBUG=true
VITE_APP_LOG_LEVEL=debug
```

### Support

For deployment support:
- Check application logs
- Review error tracking (Sentry)
- Contact system administrator
- Refer to troubleshooting documentation
