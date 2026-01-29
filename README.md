# AdScaler Console

A production-ready web application for mass-producing ad creatives using AI image generation (fal.ai) and automated text overlays (Bannerbear), orchestrated via n8n workflows and stored in Airtable.

## Architecture

```
Frontend (React/Vite) → n8n Cloud Webhooks → Airtable/fal.ai/Bannerbear
```

**Key Features:**
- Batch processing of ad creatives from Airtable records
- AI image generation via fal.ai (Flux model)
- Automated text overlay compositing via Bannerbear
- Real-time progress tracking
- Airtable integration for source data and results storage

## Quick Start

See [Quick Start Guide](./docs/QUICK_START.md) for getting started in 5 steps.

## Documentation

- **[Quick Start](./docs/QUICK_START.md)** - Get running in 30 minutes
- **[n8n Workflow Guide](./n8n-hosting/WORKFLOW_GUIDE.md)** - Build the orchestration workflows
- **[Bannerbear Setup](./docs/BANNERBEAR_SETUP.md)** - Create and configure templates
- **[Airtable Schema](./docs/AIRTABLE_SCHEMA.md)** - Required database structure
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to production

## Project Status

**Current State:**
- ✅ Frontend UI complete (Batch Processing, Command Center, Library pages)
- ✅ API client code ready (fal.ai, Bannerbear integrations)
- ✅ n8n endpoint definitions in place
- ✅ Airtable schema script ready
- ⚠️ n8n workflows need to be built (see Workflow Guide)
- ⚠️ Bannerbear templates need to be created (see Bannerbear Setup)

**Next Steps:**
1. Build n8n workflows (critical blocker)
2. Create Bannerbear templates
3. Deploy frontend
4. Test end-to-end pipeline

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
