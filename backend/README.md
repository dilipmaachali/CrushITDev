# CrushIT Backend

Backend API for CrushIT sports game scheduling application.

## Features

- User authentication with JWT
- Game management (create, join, manage)
- Real-time chat
- MongoDB database
- RESTful API

## Environment Variables

Create a `.env` file with:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=crushit
PORT=4000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
```

## Deployment

### Railway

1. Push to GitHub
2. Connect Railway to your repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Local Development

```bash
npm install
npm run build
npm start
```

## API Documentation

Once deployed, visit `/api-docs` for Swagger documentation.
