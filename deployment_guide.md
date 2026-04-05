# Deployment Guide (Home Server + Tailscale)

This guide helps you deploy the **Job Email Tracker** to your home server and access it securely from anywhere using **Tailscale**.

## Phase 1: Server Preparation

1.  **Install Tailscale**: 
    - Follow the [official instructions](https://tailscale.com/download) for your server's OS (e.g., `curl -fsSL https://tailscale.com/install.sh | sh`).
    - Connect your server: `sudo tailscale up`.
    - **Get your Tailscale IP**: Run `tailscale ip -4` or check your Tailscale dashboard.

2.  **Install Docker**: 
    - Follow the [Docker Installation Guide](https://docs.docker.com/engine/install/) for your OS.
    - Ensure `docker-compose` is available.

## Phase 2: Configuration

1.  **Transfer Code**:
    - Clone your repository to the server:
      ```bash
      git clone https://github.com/amit-v07/Job-Email-Tracker.git
      cd Job-Email-Tracker
      ```

2.  **Setup Environment Variables**:
    - Create a `.env` file on the server:
      ```bash
      cp .env.example .env
      ```
    - Replace `<YOUR_TAILSCALE_URL>` with your actual Tailscale IP or MagicDNS.
    - **Example**:
      ```ini
      BACKEND_URL=http://100.123.123.123:8000
      FRONTEND_URL=http://100.123.123.123:3000
      ```
    - Add your **GMAIL_CLIENT_ID** and **GMAIL_CLIENT_SECRET**.

3.  **Update Google Cloud Console**:
    - Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
    - Edit your OAuth 2.0 Client ID.
    - Add the **Authorized Redirect URI**:
      `http://100.123.123.123:8000/auth/callback` (Replace with your actual Tailscale IP).

## Phase 3: Launch

1.  **Start the Containers**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Verify**:
    - Open your browser (on any device connected to your Tailnet).
    - Go to `http://<YOUR_TAILSCALE_URL>:3000`.

## Re-authentication

If you move the app to a different Tailscale IP or use MagicDNS later, you **MUST** update:
1. The `.env` file (`BACKEND_URL` and `FRONTEND_URL`).
2. The Google Cloud Console Redirect URI.
3. Restart the containers: `docker-compose up -d --build`.
