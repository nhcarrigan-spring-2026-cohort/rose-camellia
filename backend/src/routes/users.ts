import { Router } from "express";
import {
  getUserByUsername,
  getUserPosts,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/:username", getUserByUsername);
router.get("/:username/posts", getUserPosts);
router.put("/:username", authenticate, updateUser);
router.put("/:username/password", authenticate, changePassword);
router.delete("/:username", authenticate, deleteUser);

export default router;
