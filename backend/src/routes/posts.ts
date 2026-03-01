import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  markResolved,
  deletePost,
  getVerificationCode,
  verifyOwnershipCode,
} from "../controllers/postController.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  verifyCodeSchema,
} from "../validators/postValidators.js";

const router = Router();

router.post("/", optionalAuth, validate(createPostSchema), createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/:id/verification-code", getVerificationCode); // NEW: Get code (owner only)
router.post("/:id/verify", validate(verifyCodeSchema), verifyOwnershipCode); // NEW: Verify code
router.put("/:id", optionalAuth, validate(updatePostSchema), updatePost);
router.patch("/:id/resolve", optionalAuth, markResolved);
router.delete("/:id", optionalAuth, deletePost);

export default router;
