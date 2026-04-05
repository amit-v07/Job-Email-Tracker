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

## Phase 4: Verification & Access

1.  **Open your browser** (on any device connected to your Tailnet).
2.  **Go to the Frontend URL**: `http://tail1921db.ts.net:3000`
3.  **Ensure the Backend link is reachable**: `http://tail1921db.ts.net:8000`.

---

## (Optional) Advanced: Enable HTTPS (Tailscale SSL)

If you later want to use **`https://`** and remove the `:3000` port number:

1.  **Enable HTTPS Certificates** in your [Tailscale Settings](https://login.tailscale.com/admin/dns).

2.  **Run Tailscale Serve** on the server:
    ```bash
    tailscale serve --bg 3000
    tailscale serve --bg 8000 8000
    ```

3.  **Update `.env`**:
    ```ini
    BACKEND_URL=https://tail1921db.ts.net:8000
    FRONTEND_URL=https://tail1921db.ts.net
    ```

4.  **Update Google OAuth Redirect URI**: `https://tail1921db.ts.net:8000/auth/callback`


## Common Errors & Troubleshooting

### Portainer Build Failures (DNS)
- **Error**: `lookup registry-1.docker.io: server misbehaving`
- **Fix**: Your server has a DNS issue. Run `echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf` to use Google DNS temporarily.
- **Portainer Tip**: Always use the **Git Repository** method in Portainer Stacks instead of the Web Editor to ensure the build context is correct.

### 400: redirect_uri_mismatch
- Ensure the URI in **Google Cloud Console** exactly matches `BACKEND_URL + /auth/callback`.
- If using HTTPS via Tailscale Serve, the URI must start with `https://`.

## Re-authentication & Updates

If you change your Tailscale hostname or move the app later, you **MUST** update:
1. The `.env` file (`BACKEND_URL` and `FRONTEND_URL`).
2. The Google Cloud Console Redirect URI.
3. Restart the containers: `docker-compose up -d --build`.

