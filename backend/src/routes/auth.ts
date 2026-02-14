import { Router } from "express";
import {
  register,
  login,
  createGuestUser,
  verifyToken,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  guestUserSchema,
} from "../validators/authValidators.js";
import { authLimiter, guestCreationLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/guest", guestCreationLimiter, validate(guestUserSchema), createGuestUser);
router.get("/verify", verifyToken);

export default router;
