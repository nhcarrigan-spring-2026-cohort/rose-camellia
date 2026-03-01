import type { Request, Response } from "express";
import { prisma } from "../index.js";
import bcrypt from "bcrypt";

// Get user by username
export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        name: true,
        email: true,
        contactNumber: true,
        createdAt: true,
        verified: true,
        isGuest: true,
        Post: {
          include: {
            ImageUrls: {
              orderBy: {
                isPrimary: "desc",
              },
              take: 1,
            },
            _count: {
              select: {
                Comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's posts (with filter for active/resolved)
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { resolved } = req.query;

    const where: any = {
      authorUsername: username,
    };

    if (resolved !== undefined) {
      where.resolved = resolved === "true";
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        ImageUrls: {
          orderBy: {
            isPrimary: "desc",
          },
        },
        _count: {
          select: {
            Comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { name, email, contactNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isGuest) {
      return res.status(403).json({ error: "Cannot update guest user profiles" });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    const updatedUser = await prisma.user.update({
      where: { username },
      data: updateData,
      select: {
        username: true,
        name: true,
        email: true,
        contactNumber: true,
        createdAt: true,
        verified: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.hashedPassword) {
      return res.status(404).json({ error: "User not found or guest user" });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { hashedPassword: newHashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete user account
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({
      where: { username },
    });

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
