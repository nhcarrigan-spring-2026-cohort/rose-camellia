import { Router } from "express";
import authRoutes from "./auth.js";
import postRoutes from "./posts.js";
import imageRoutes from "./images.js";
import commentRoutes from "./comments.js";
import userRoutes from "./users.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/images", imageRoutes);
router.use("/comments", commentRoutes);
router.use("/users", userRoutes);

export default router;
