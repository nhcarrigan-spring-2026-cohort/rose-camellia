import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  createImage,
  getImages,
  getImagesByPost,
  setPrimaryImage,
  deleteImageById,
} from "../controllers/imageController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", optionalAuth, upload.single("image"), createImage);
router.get("/", getImages);
router.get("/post/:postId", getImagesByPost);
router.patch("/:id/primary", optionalAuth, setPrimaryImage);
router.delete("/:id", optionalAuth, deleteImageById);

export default router;
