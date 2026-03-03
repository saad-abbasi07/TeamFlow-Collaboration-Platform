# Environment Variables

## Frontend (Next.js)

Create a `.env.local` file in `teamflow-frontend/`.

Required:

- `NEXT_PUBLIC_API_BASE`
  - Example (local): `http://localhost:5000/api`
  - Example (prod): `https://your-backend-domain.com/api`

Notes:

- The frontend reads the API base URL from `process.env.NEXT_PUBLIC_API_BASE`.
- If not set, it falls back to `http://localhost:5000/api`.
