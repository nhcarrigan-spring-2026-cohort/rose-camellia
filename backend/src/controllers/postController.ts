import type { Request, Response } from "express";
import { prisma } from "../index.js";
import { deleteImage } from "../config/storage.js";
import {
  generateVerificationCode,
  formatVerificationCode,
  normalizeVerificationCode,
} from "../utils/verificationCode.js";

// Create a post
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      authorUsername,
      postType,
      title,
      description,
      petName,
      petType,
      breed,
      color,
      size,
      location,
      latitude,
      longitude,
      lostFoundDate,
      contactEmail,
      contactPhone,
      reward,
    } = req.body;

    if (!postType || !title || !description || !location || !lostFoundDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (authorUsername) {
      const user = await prisma.user.findUnique({
        where: { username: authorUsername },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    }

    // Generate verification code for lost pets
    const verificationCode =
      postType === "lost" ? generateVerificationCode() : null;

    const post = await prisma.post.create({
      data: {
        authorUsername: authorUsername || null,
        postType,
        title,
        description,
        petName: petName || null,
        petType: petType || null,
        breed: breed || null,
        color: color || null,
        size: size || null,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        lostFoundDate: new Date(lostFoundDate),
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        reward: reward ? parseFloat(reward) : null,
        resolved: false,
        verificationCode: verificationCode,
      },
      include: {
        User: {
          select: {
            username: true,
            name: true,
            email: true,
            contactNumber: true,
          },
        },
        ImageUrls: true,
      },
    });

    // Include verification code in response ONLY for the owner
    if (verificationCode) {
      return res.status(201).json({
        ...post,
        verificationCode: formatVerificationCode(verificationCode),
        verificationMessage:
          "⚠️ IMPORTANT: Save this code! Share it only with someone who has found your pet to verify ownership.",
      });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all posts with filtering
export const getPosts = async (req: Request, res: Response) => {
  try {
    const {
      postType,
      authorUsername,
      resolved,
      petType,
      location,
      search,
      limit = "50",
      offset = "0",
    } = req.query;

    const where: any = {};

    if (postType) where.postType = postType;
    if (authorUsername) where.authorUsername = authorUsername;
    if (resolved !== undefined) where.resolved = resolved === "true";
    if (petType) where.petType = petType;
    if (location) {
      where.location = {
        contains: location as string,
        mode: "insensitive",
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { petName: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        postType: true,
        authorUsername: true,
        petName: true,
        title: true,
        description: true,
        petType: true,
        breed: true,
        color: true,
        size: true,
        location: true,
        latitude: true,
        longitude: true,
        lostFoundDate: true,
        resolved: true,
        resolvedAt: true,
        contactEmail: true,
        contactPhone: true,
        reward: true,
        // NEVER include verification code in public list
        verificationCode: false,
        User: {
          select: {
            username: true,
            name: true,
            email: true,
            contactNumber: true,
            isGuest: true,
          },
        },
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
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.post.count({ where });

    res.json({
      posts,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + posts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        postType: true,
        authorUsername: true,
        petName: true,
        title: true,
        description: true,
        petType: true,
        breed: true,
        color: true,
        size: true,
        location: true,
        latitude: true,
        longitude: true,
        lostFoundDate: true,
        resolved: true,
        resolvedAt: true,
        contactEmail: true,
        contactPhone: true,
        reward: true,
        // NEVER include verification code in public view
        verificationCode: false,
        User: {
          select: {
            username: true,
            name: true,
            email: true,
            contactNumber: true,
            isGuest: true,
          },
        },
        ImageUrls: {
          orderBy: {
            isPrimary: "desc",
          },
        },
        Comments: {
          include: {
            User: {
              select: {
                username: true,
                name: true,
                isGuest: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Add hint that verification is available (but don't show the code)
    const response = {
      ...post,
      hasVerification: post.postType === "lost",
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get verification code (only for post owner)
export const getVerificationCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        postType: true,
        authorUsername: true,
        verificationCode: true,
        title: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only post owner can retrieve the code
    if (post.authorUsername !== username) {
      return res
        .status(403)
        .json({ error: "You can only view your own verification code" });
    }

    if (post.postType !== "lost") {
      return res
        .status(400)
        .json({ error: "Verification codes only available for lost pets" });
    }

    if (!post.verificationCode) {
      return res.status(404).json({ error: "No verification code found" });
    }

    res.json({
      postId: post.id,
      postTitle: post.title,
      verificationCode: formatVerificationCode(post.verificationCode),
      message:
        "Share this code only with someone who claims to have found your pet",
    });
  } catch (error) {
    console.error("Error getting verification code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify ownership code
export const verifyOwnershipCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Verification code required" });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        postType: true,
        verificationCode: true,
        title: true,
        petName: true,
        User: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postType !== "lost") {
      return res
        .status(400)
        .json({ error: "Verification only available for lost pets" });
    }

    if (!post.verificationCode) {
      return res
        .status(404)
        .json({ error: "No verification code set for this post" });
    }

    // Normalize both codes for comparison
    const inputCode = normalizeVerificationCode(code);
    const storedCode = normalizeVerificationCode(post.verificationCode);

    const verified = inputCode === storedCode;

    if (verified) {
      // Return contact info only if verified
      res.json({
        verified: true,
        message: "✅ Verified! This person is the pet owner.",
        ownerInfo: {
          name: post.User?.name,
          contactEmail: post.User?.email,
          contactPhone: post.User?.contactNumber,
        },
        petInfo: {
          title: post.title,
          petName: post.petName,
        },
      });
    } else {
      res.json({
        verified: false,
        message: "❌ Invalid code. This person may not be the real owner.",
        warning: "Do not share pet details or location with this person.",
      });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Whitelist of Prisma-writable post fields — everything else is ignored.
    // This prevents computed/relational fields like `comments`, `hasVerification`,
    // `resolved`, `updatedAt`, etc. from reaching Prisma and causing errors.
    const UPDATABLE_FIELDS = [
      "postType", "title", "description", "petName", "petType", "breed",
      "color", "size", "location", "latitude", "longitude", "lostFoundDate",
      "contactEmail", "contactPhone", "reward", "authorUsername",
    ] as const;

    const cleanData: any = {};
    for (const key of UPDATABLE_FIELDS) {
      if (updateData[key] !== undefined) {
        cleanData[key] = updateData[key];
      }
    }

    if (cleanData.lostFoundDate) {
      cleanData.lostFoundDate = new Date(cleanData.lostFoundDate);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: cleanData,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        postType: true,
        authorUsername: true,
        petName: true,
        title: true,
        description: true,
        petType: true,
        breed: true,
        color: true,
        size: true,
        location: true,
        latitude: true,
        longitude: true,
        lostFoundDate: true,
        resolved: true,
        resolvedAt: true,
        contactEmail: true,
        contactPhone: true,
        reward: true,
        verificationCode: false,
        User: true,
        ImageUrls: true,
        Comments: true,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark post as resolved
export const markResolved = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
      include: {
        User: true,
        ImageUrls: true,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Error marking post as resolved:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        ImageUrls: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    for (const image of post.ImageUrls) {
      await deleteImage(image.url);
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
