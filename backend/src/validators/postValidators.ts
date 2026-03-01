import { z } from "zod";

export const createPostSchema = z.object({
  authorUsername: z.string().optional(),

  postType: z.enum(["lost", "found", "sighting"], {
    message: "Post type must be 'lost', 'found', or 'sighting'",
  }),

  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title too long")
    .refine((val) => val.trim().length > 0, "Title cannot be empty"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long")
    .refine((val) => val.trim().length > 0, "Description cannot be empty"),

  petName: z.string().max(50, "Pet name too long").optional(),
  petType: z.string().max(50, "Pet type too long").optional(),
  breed: z.string().max(100, "Breed too long").optional(),
  color: z.string().max(100, "Color too long").optional(),
  size: z.string().max(50, "Size too long").optional(),

  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location too long")
    .refine((val) => val.trim().length > 0, "Location cannot be empty"),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(
      z
        .string()
        .regex(/^-?\d+\.?\d*$/)
        .transform(Number),
    ),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(
      z
        .string()
        .regex(/^-?\d+\.?\d*$/)
        .transform(Number),
    ),

  lostFoundDate: z.string().datetime("Invalid date format").or(z.string().date("Invalid date format")).or(z.date()),

  contactEmail: z
    .string()
    .email({ message: "Invalid email" })
    .max(100)
    .optional()
    .or(z.literal("")),
  contactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone")
    .optional()
    .or(z.literal("")),

  reward: z
    .number()
    .min(0, "Reward cannot be negative")
    .max(1000000, "Reward too high")
    .optional()
    .or(
      z
        .string()
        .regex(/^\d+\.?\d*$/)
        .transform(Number),
    ),
});

export const updatePostSchema = createPostSchema.partial();

// Validation for verification code
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be at least 6 characters")
    .max(7, "Verification code too long") // Allows for hyphen (ABC-123)
    .regex(
      /^[A-Z0-9-]+$/i,
      "Verification code must contain only letters and numbers",
    ),
});
