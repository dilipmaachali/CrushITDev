import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
  userName?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Allow dev mode test token
    if (token === 'test-token-dev-mode') {
      req.userId = 'dev-user-123';
      req.email = 'dev@crushit.com';
      req['userName'] = 'DevUser';  // Add userName for dev mode
      next();
      return;
    }
    
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
