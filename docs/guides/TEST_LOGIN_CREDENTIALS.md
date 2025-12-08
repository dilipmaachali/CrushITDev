# CrushIT - Test Login Credentials

## Default Test Accounts

The backend automatically creates these test accounts on startup:

### Account 1
- **Email:** `user@example.com`
- **Password:** `password123`
- **Name:** John Doe

### Account 2
- **Email:** `demo@test.com`
- **Password:** `password123`
- **Name:** Demo User

### Account 3
- **Email:** `test@crushit.com`
- **Password:** `password123`
- **Name:** Test Player

---

## How to Use

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   Wait for: `✅ Server running on port 4000`

2. **Start Mobile App:**
   ```bash
   cd app
   npx expo start
   ```

3. **Login with any account above**
   - Email: `user@example.com`
   - Password: `password123`

---

## Troubleshooting

### "Invalid credentials" error?

**Check if backend is running:**
```bash
# Test backend health
curl http://localhost:4000/

# Expected response:
{"status":"ok","service":"CrushIT Backend","version":"1.0.0"}
```

**Test login directly:**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_default_1",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Backend not responding?

1. Check if backend is running on port 4000
2. Verify IP address in `app/src/config/api.ts` matches your machine IP
3. Make sure both backend and app are on the same network

### Creating New Account

You can also register a new account:
- Click "Sign Up" on the login screen
- Enter:
  - Name: Your Name
  - Email: your@email.com
  - Password: (minimum 6 characters)

---

## API Base URLs

- **Mobile (Expo Go):** `http://192.168.29.41:4000` (your machine IP)
- **Web/Browser:** `http://localhost:4000`

Update machine IP in: `app/src/config/api.ts`
