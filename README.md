# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Local Development Setup

This project uses n8n for workflow automation alongside the React application. Both services run locally for development.

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Docker and Docker Compose ([install Docker](https://docs.docker.com/get-docker/))

### Quick Start

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm i
```

3. **Start n8n (in one terminal)**
```sh
npm run docker:up
```

4. **Start React app (in another terminal)**
```sh
npm run dev
```

5. **Access the applications**
- React App: http://localhost:8080
- n8n: http://localhost:5678

### Available npm Scripts

- `npm run dev` - Start Vite development server (React app)
- `npm run docker:up` - Start n8n in Docker (detached mode)
- `npm run docker:down` - Stop n8n container
- `npm run docker:logs` - View n8n logs
- `npm run docker:restart` - Restart n8n container
- `npm run docker:debug` - Start n8n in debug mode (foreground)
- `npm run dev:full` - Start both n8n and React app together
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### n8n Configuration

n8n is configured via `.env.docker` file. Default settings:
- Host: localhost
- Port: 5678
- Protocol: http
- Basic Auth: disabled (for local dev)

To customize, edit `.env.docker` or set environment variables.

### Importing Existing Workflows

Existing n8n workflows are available in the `n8n-hosting/` directory and are mounted to the container at `/workflows`.

To import:
1. Open n8n at http://localhost:5678
2. Click "Import from File"
3. Navigate to `/workflows/` and select a workflow JSON file

### Data Persistence

n8n data (workflows, credentials, executions) is stored in `./n8n-data/` which persists across container restarts.

### Troubleshooting

**Port conflicts**: If port 5678 or 8080 is already in use:
- Stop other services using these ports, or
- Modify the port mappings in `compose.yaml`

**n8n not starting**: Check logs with `npm run docker:logs`

**React app not connecting to n8n**: Verify `VITE_N8N_WEBHOOK_URL` in `.env` file

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
