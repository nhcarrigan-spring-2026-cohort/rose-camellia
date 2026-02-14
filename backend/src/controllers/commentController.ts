import type { Request, Response } from "express";
import { prisma } from "../index.js";

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId, authorUsername, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ error: "postId and content are required" });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Verify user exists if username provided
    if (authorUsername) {
      const user = await prisma.user.findUnique({
        where: { username: authorUsername },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    }

    const comment = await prisma.comments.create({
      data: {
        postId,
        authorUsername: authorUsername || null,
        content,
      },
      include: {
        User: {
          select: {
            username: true,
            name: true,
            isGuest: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get comments for a post
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comments.findMany({
      where: { postId },
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
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const comment = await prisma.comments.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedComment = await prisma.comments.update({
      where: { id },
      data: { content },
      include: {
        User: {
          select: {
            username: true,
            name: true,
            isGuest: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comments.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await prisma.comments.delete({
      where: { id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
