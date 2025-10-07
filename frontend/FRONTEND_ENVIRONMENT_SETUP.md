# Frontend Environment Variables Setup Guide

## Required Environment Variables

To run the Iris frontend application, you need to set up the following environment variables:

### 1. Supabase Configuration (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 2. Bitquery API Configuration (Optional - for price updates)
```bash
BITQUERY_API_KEY=your_bitquery_api_key
ACCESS_TOKEN=your_bitquery_access_token
```

**How to get these values:**
1. Go to [Bitquery.io](https://bitquery.io)
2. Sign up for an account
3. Go to API section
4. Generate API key and access token

### 3. Environment Type
```bash
NODE_ENV=development
```

## Setup Instructions

### Step 1: Create Environment File
Create a `.env.local` file in the frontend directory:

```bash
# Copy the template
cp env-template.txt .env.local
```

### Step 2: Fill in Your Values
Edit `.env.local` and replace the placeholder values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bitquery API Configuration (optional)
BITQUERY_API_KEY=your_actual_api_key
ACCESS_TOKEN=your_actual_access_token

# Environment
NODE_ENV=development
```

### Step 3: Restart Development Server
After setting up the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
yarn dev
```

## Environment Variable Types

### Public Variables (NEXT_PUBLIC_*)
- **Exposed to browser**: These variables are accessible in client-side code
- **Used for**: Supabase client initialization in components and services
- **Security**: Safe to expose as they use public API keys

### Server-Only Variables
- **Not exposed to browser**: These variables are only available in API routes
- **Used for**: Server-side operations like Bitquery API calls
- **Security**: Keep these secret as they may contain sensitive API keys

## Verification

### Check if Environment Variables are Loaded
1. Open browser developer tools
2. Go to Console tab
3. Type: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
4. You should see your Supabase URL (not undefined)

### Test Supabase Connection
1. Go to the dashboard page
2. Check if data loads without errors
3. Look for any "Supabase configuration not available" messages

## Troubleshooting

### Common Issues

1. **"Supabase configuration not available"**
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Make sure the file is named `.env.local` (not `.env`)
   - Restart the development server

2. **Build fails with "supabaseUrl is required"**
   - Environment variables are not available during build time
   - This is normal and expected - the app will work in development mode

3. **API calls fail**
   - Check that your Supabase project is active
   - Verify the API keys are correct
   - Check Supabase project settings for any restrictions

### File Structure
```
frontend/
├── .env.local          # Your environment variables (create this)
├── env-template.txt    # Template file (already exists)
└── ...
```

## Security Notes

- **Never commit `.env.local`** to version control
- **Use public API keys only** for client-side operations
- **Keep sensitive keys** in server-side environment variables only
- **Rotate API keys** regularly for security

## Next Steps

After setting up environment variables:

1. **Test the application**: `yarn dev`
2. **Check dashboard**: Navigate to `/dashboard`
3. **Test API endpoints**: Try the pattern recognition features
4. **Monitor console**: Look for any error messages

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase project is active and accessible
4. Check network tab for failed API requests
