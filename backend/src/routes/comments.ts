import { Router } from "express";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentValidators.js";

const router = Router();

router.post("/", optionalAuth, validate(createCommentSchema), createComment);
router.get("/post/:postId", getCommentsByPost);
router.put("/:id", optionalAuth, validate(updateCommentSchema), updateComment);
router.delete("/:id", optionalAuth, deleteComment);

export default router;
