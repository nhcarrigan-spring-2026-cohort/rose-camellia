import type { Request, Response } from "express";
import { prisma } from "../index.js";
import { uploadImage, deleteImage } from "../config/storage.js";
import { v4 as uuidv4 } from "uuid";

// Upload image to post
export const createImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { postId, isPrimary } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Upload to Supabase Storage
    const filename = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;
    const imageUrl = await uploadImage(
      req.file.buffer,
      filename,
      req.file.mimetype,
    );

    if (!imageUrl) {
      return res.status(500).json({ error: "Failed to upload image" });
    }

    // If this is marked as primary, unmark other images
    if (isPrimary === "true" || isPrimary === true) {
      await prisma.imageUrls.updateMany({
        where: { postId },
        data: { isPrimary: false },
      });
    }

    // Save to database
    const image = await prisma.imageUrls.create({
      data: {
        postId: postId,
        url: imageUrl,
        isPrimary: isPrimary === "true" || isPrimary === true,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error("Error creating image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all images
export const getImages = async (req: Request, res: Response) => {
  try {
    const images = await prisma.imageUrls.findMany({
      include: {
        Post: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get images by post ID
export const getImagesByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const images = await prisma.imageUrls.findMany({
      where: { postId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Set primary image
export const setPrimaryImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await prisma.imageUrls.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Unmark all other images for this post
    await prisma.imageUrls.updateMany({
      where: { postId: image.postId },
      data: { isPrimary: false },
    });

    // Mark this image as primary
    const updatedImage = await prisma.imageUrls.update({
      where: { id },
      data: { isPrimary: true },
    });

    res.json(updatedImage);
  } catch (error) {
    console.error("Error setting primary image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete image
export const deleteImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await prisma.imageUrls.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from Supabase Storage
    await deleteImage(image.url);

    // Delete from database
    await prisma.imageUrls.delete({
      where: { id },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
