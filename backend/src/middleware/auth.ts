import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Type-safe JWT secret getter
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
}

const JWT_SECRET = getJWTSecret();

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: {
    username: string;
    email: string;
    isGuest?: boolean;
  };
}

// Middleware to verify JWT token
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const tokenParts = authHeader.split(" ");
    const token = tokenParts[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as AuthRequest).user = {
        username: decoded.username,
        email: decoded.email,
        isGuest: decoded.isGuest || false,
      };
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Authentication error" });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const tokenParts = authHeader.split(" ");
      const token = tokenParts[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          (req as AuthRequest).user = {
            username: decoded.username,
            email: decoded.email,
            isGuest: decoded.isGuest || false,
          };
        } catch (error) {
          // Token invalid, but we don't fail - just continue without user
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
