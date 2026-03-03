# Environment Variables

## Backend (Node/Express)

Create a `.env` file in `teamflow-backend/`.

Required:

- `MONGO_URI`
  - Example: `mongodb://127.0.0.1:27017/teamflow`
- `JWT_SECRET`
  - Example: `your-long-random-secret`

Optional:

- `PORT`
  - Default: `5000`
- `FRONTEND_URL`
  - Controls CORS allowed origins.
  - Default: `http://localhost:3000`
  - Supports comma-separated list:
    - Example: `http://localhost:3000,https://your-frontend-domain.com`
