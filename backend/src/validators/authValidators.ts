import { z } from "zod";

// Email validation schema (strict)
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email too short")
  .max(100, "Email too long")
  .refine(
    (email) => {
      // Basic check for common disposable email domains
      const disposableDomains = [
        "tempmail.com",
        "throwaway.email",
        "10minutemail.com",
        "guerrillamail.com",
        "mailinator.com",
        "trashmail.com",
      ];
      const domain = email.split("@")[1];
      if (!domain) return false; // No domain found
      return !disposableDomains.includes(domain.toLowerCase());
    },
    { message: "Disposable email addresses are not allowed" },
  );

// Registration validation
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .refine((val) => val.trim().length > 0, "Username cannot be empty"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .refine((val) => val.trim().length > 0, "Name cannot be empty"),

  email: emailSchema,

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  contactNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Guest user validation (stricter to prevent abuse)
export const guestUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .refine((val) => val.trim().length > 0, "Name cannot be empty"),

  email: emailSchema,

  contactNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});
