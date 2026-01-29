# Deployment Guide

This guide covers deploying the AdScaler Console frontend to production.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Hosting account (Vercel, Netlify, or similar)

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### Step 2: Configure Build Settings

**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### Step 3: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_N8N_WEBHOOK_BASE_URL=https://williamsforeal.app.n8n.cloud/webhook
VITE_BANNERBEAR_API_KEY=your-actual-bannerbear-key
VITE_FAL_KEY=your-actual-fal-key
VITE_SUPABASE_URL=https://qtvambsyicfdfihwyaea.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

**Important:** 
- Never commit these values to git
- Set them in Vercel dashboard only
- Use different values for Production, Preview, and Development environments if needed

### Step 4: Deploy

1. Push to your main branch (auto-deploys)
2. Or click "Deploy" in Vercel dashboard
3. Wait for build to complete
4. Access your app at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Option 2: Deploy to Netlify

### Step 1: Build Locally

```bash
npm run build
```

### Step 2: Deploy

**Option A: Drag & Drop**
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the `dist` folder onto the page
3. Your site is live!

**Option B: Git Integration**
1. Connect GitHub repository in Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables (same as Vercel)
5. Deploy

## Option 3: Deploy to Static Hosting (AWS S3, Cloudflare Pages, etc.)

### Step 1: Build

```bash
npm run build
```

### Step 2: Upload dist/ Folder

Upload the entire contents of the `dist/` folder to your hosting provider.

### Step 3: Configure Environment Variables

Most static hosts don't support runtime environment variables for Vite apps. You have two options:

**Option A: Build-time Variables**
- Set environment variables before running `npm run build`
- Variables are baked into the build
- Less secure but simpler

**Option B: Runtime Configuration**
- Create a `public/config.js` file that gets loaded at runtime
- Update `index.html` to load this file
- Host config.js separately or inject it server-side

## Environment Variables Reference

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base URL for n8n webhooks | Your n8n Cloud instance |
| `VITE_BANNERBEAR_API_KEY` | Bannerbear API key | Bannerbear dashboard → Settings → API |
| `VITE_FAL_KEY` | fal.ai API key | fal.ai dashboard → Keys |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Supabase dashboard → Settings → API |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_N8N_WEBHOOK_BASE_URL` | n8n webhook base | `https://williamsforeal.app.n8n.cloud/webhook` |

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test webhook endpoints are accessible
- [ ] Verify API keys are working (check browser console for errors)
- [ ] Test single record pipeline
- [ ] Test batch processing
- [ ] Verify images are generating correctly
- [ ] Check that Airtable records are being updated

## Troubleshooting

**Build fails:**
- Check Node.js version (need 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run build` locally first

**Environment variables not working:**
- Verify variables start with `VITE_` prefix
- Rebuild after adding variables
- Check browser console for undefined values

**Webhook calls failing:**
- Verify `VITE_N8N_WEBHOOK_BASE_URL` is correct
- Check n8n workflows are active
- Verify CORS is enabled in n8n (if needed)

**API errors:**
- Check API keys are valid
- Verify API quotas haven't been exceeded
- Check browser network tab for detailed error messages

## Continuous Deployment

### Vercel/Netlify (Automatic)

- Push to `main` branch → Auto-deploys
- Push to other branches → Creates preview deployment

### Manual Deployment

```bash
# Build
npm run build

# Upload dist/ folder to your hosting provider
# Or use their CLI tools
```

## Monitoring

After deployment, monitor:

1. **Error Rates:** Check hosting provider error logs
2. **API Usage:** Monitor fal.ai, Bannerbear, and Airtable API usage
3. **Performance:** Use browser DevTools → Network tab
4. **User Feedback:** Check for console errors in production

## Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate API keys** if they're ever exposed
3. **Use environment-specific keys** for production vs development
4. **Enable CORS** only for your domain in API settings
5. **Monitor API usage** to detect abuse
