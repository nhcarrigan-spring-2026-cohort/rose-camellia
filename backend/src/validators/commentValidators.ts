import { z } from "zod";

export const createCommentSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  authorUsername: z.string().optional(),
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment too long")
    .refine((val) => val.trim().length > 0, "Comment cannot be empty")
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment too long")
    .refine((val) => val.trim().length > 0, "Comment cannot be empty")
});
