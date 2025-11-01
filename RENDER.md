# Deployment on Render.com

## Overview

TaskFlow can be deployed on Render.com with both frontend and backend services. This guide walks through the setup process.

## Prerequisites

- Render.com account (free or paid)
- GitHub repository with your TaskFlow code
- PostgreSQL database URL (create via Render's dashboard)
- Set environment variables

## Backend Deployment

### Step 1: Create Backend Service

1. Go to [render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `yarn install && yarn build && yarn prisma:generate`
   - **Start Command**: `yarn start`

### Step 2: Add PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `taskflow-db`
   - **Database**: taskflow
   - **User**: taskflow
   - **Region**: Same as backend (recommended)

### Step 3: Set Environment Variables

In backend service settings, add:

```
DATABASE_URL=<from PostgreSQL service>
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-render-url.onrender.com
```

To generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy Backend

1. Click "Deploy" button
2. Monitor deployment logs
3. Once deployed, get your backend URL: `https://taskflow-backend.onrender.com`

## Frontend Deployment

### Step 1: Create Frontend Service

1. Click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `taskflow-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn install && yarn build`
   - **Publish Directory**: `dist`

### Step 2: Set Environment Variables

In frontend service settings, add:

```
VITE_API_URL=https://taskflow-backend.onrender.com/api
```

### Step 3: Deploy Frontend

1. Click "Deploy" button
2. Once deployed, get your frontend URL: `https://taskflow-frontend.onrender.com`

## Complete Deployment Checklist

- [ ] Backend service created and deployed
- [ ] PostgreSQL database created and connected
- [ ] Database migrations run successfully
- [ ] Backend service has all environment variables set
- [ ] Frontend service created and deployed
- [ ] Frontend VITE_API_URL correctly points to backend
- [ ] Test login works in production
- [ ] SSL/HTTPS enabled (automatic on Render)
- [ ] Monitoring alerts configured

## Troubleshooting

### Backend service keeps crashing

1. Check logs in Render dashboard
2. Verify DATABASE_URL is correct
3. Ensure migrations ran successfully
4. Check JWT_SECRET is set

### Frontend shows blank page

1. Check browser console for errors
2. Verify VITE_API_URL points to correct backend
3. Check CORS settings in backend
4. Clear browser cache

### Database connection fails

1. Verify DATABASE_URL format is correct
2. Check database service status in Render dashboard
3. Ensure database has been initialized
4. Run migrations manually if needed

### Deploy fails with MODULE_NOT_FOUND

1. Clear Render build cache
2. Trigger new deploy
3. If still fails, check package.json for typos
4. Ensure yarn.lock is committed to git

## Monitoring and Maintenance

### View Logs

In Render dashboard:
1. Select service
2. Click "Logs" tab
3. Monitor for errors

### Manual Database Migrations

If migrations don't run automatically:

1. In backend service, click "Shell"
2. Run: `yarn prisma:migrate deploy`
3. Or: `yarn db:seed` for test data

### Update Environment Variables

1. Select service in Render dashboard
2. Click "Environment" tab
3. Edit variables
4. Service will auto-redeploy

## Performance Tips

1. **Use Render's free tier carefully** - Spins down after inactivity
2. **Upgrade database to paid** - Free tier has limitations
3. **Enable auto-scaling** - For production workloads
4. **Monitor disk usage** - Especially for database

## Cost Estimation

- **Frontend (Static Site)**: Free
- **Backend (Web Service, free tier)**: Free (with limitations)
- **PostgreSQL**: $9/month minimum (production-ready)
- **Total**: ~$9/month for small production setup

## Upgrading to Production

For production deployments:

1. **Upgrade Backend Service**: From free to paid tier
2. **Upgrade Database**: To at least the $9/month plan
3. **Enable SSL**: Verify in service settings (should be automatic)
4. **Configure backups**: Enable automated backups for database
5. **Set resource limits**: Configure CPU and memory limits
6. **Enable monitoring**: Set up alerts for errors

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Environment Variables on Render](https://render.com/docs/environment-variables)
