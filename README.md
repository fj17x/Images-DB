## Populating the database

```bash
# Go to scripts directory.
cd api/scripts

# Run populate_db.sql file (Assuming username and password are "postgres").
psql --username postgres -f populate_db.sql
```

## Initiating API

```bash
# Go to api directory.
cd api

# Start server.
npm start
```

## Initiating client

```bash
# Go to client directory.
cd client

# Start client.
npm run dev
```

You can now view the application at http://localhost:5173/

