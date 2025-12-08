export interface User {
  id: string;
  email: string;
  password?: string; // hashed
  name: string;
  phone?: string;
  avatar?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface JWTPayload {
  userId: string;
  email: string;
}
