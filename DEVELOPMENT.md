# Development Setup

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer, with npm
- Git (if you are cloning the repository)

The backend uses SQLite by default, so a separate database server is not needed for local development.

## Frontend

From the repository root:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually <http://localhost:5173>). For a production build, run `npm run build`; `npm run lint` runs ESLint.

The frontend's REST API defaults to `http://127.0.0.1:8000/api`. To override it, create `frontend/.env.local` with:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Authentication always uses the Django API. Production deployments must set `VITE_API_URL` to the public HTTPS backend origin ending in `/api` in the frontend hosting provider's build environment. Replace the example value in `frontend/.env.production`; loopback addresses such as `127.0.0.1` refer to the visitor's own device and will not reach the deployed backend. The deployed Django service must allow the frontend origin through CORS.

## Backend

Create and activate a virtual environment from the repository root, then install the pinned dependencies:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

On Windows PowerShell, use `py -m venv .venv`, activate with `.venv\Scripts\Activate.ps1`, and use `py -m pip` for the two pip commands above.

Apply database migrations and start Django:

```sh
cd backend
python manage.py migrate
python manage.py runserver
```

The API is then available at <http://127.0.0.1:8000>. Create an admin account if needed with `python manage.py createsuperuser` from the `backend` directory.

## Run Both

Use two terminals after completing setup. In the first, activate the virtual environment and run the backend commands above. In the second:

```sh
cd frontend
npm run dev
```

Alternatively, from the repository root on Linux or macOS, run the bootstrap script once:

```sh
bash scripts/setup-dev.sh
```

The script creates `.venv` if needed, installs backend and frontend dependencies, and applies migrations. After setup, start both servers together from the repository root on Linux or macOS:

```sh
bash scripts/start-dev.sh
```

The backend is served at <http://127.0.0.1:8000> and the frontend at <http://127.0.0.1:5173>. Press Ctrl+C to stop both. Alternatively, start each server in its own terminal as described above.

## Real-Time Chat Note

The frontend's chat components currently use a Socket.IO server at `http://localhost:5000` (overridable with `VITE_SOCKET_URL`). The Django project exposes Django Channels WebSocket routes through ASGI on port 8000, but Django Channels does not implement the Socket.IO protocol. The repository setup alone therefore starts the REST API and frontend, not the Socket.IO service required by those chat components.
