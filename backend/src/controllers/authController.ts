import type { Request, Response } from "express";
import { prisma } from "../index.js";
import bcrypt from "bcrypt";
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

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, contactNumber } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        hashedPassword,
        contactNumber: contactNumber || null,
        isGuest: false,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create guest user (for quick posting)
export const createGuestUser = async (req: Request, res: Response) => {
  try {
    const { name, email, contactNumber } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required for guest users" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Create guest user with auto-generated username
    const guestUsername = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const guestUser = await prisma.user.create({
      data: {
        username: guestUsername,
        name: name || "Anonymous",
        email,
        contactNumber: contactNumber || null,
        hashedPassword: null,
        isGuest: true,
      },
    });

    // Generate a temporary token
    const token = jwt.sign(
      { username: guestUser.username, email: guestUser.email, isGuest: true },
      JWT_SECRET,
      { expiresIn: "24h" } // Shorter expiry for guests
    );

    res.status(201).json({
      message: "Guest user created",
      user: {
        username: guestUser.username,
        name: guestUser.name,
        email: guestUser.email,
        contactNumber: guestUser.contactNumber,
        isGuest: true,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify token
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const tokenParts = authHeader.split(" ");
    const token = tokenParts[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { username: decoded.username },
      select: {
        username: true,
        name: true,
        email: true,
        contactNumber: true,
        isGuest: true,
        verified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
