import express from "express";
import multer from "multer";
import {
  createPublication,
  getPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
} from "../controllers/publicationController";

import { upload } from "../utils/multer";
const router = express.Router();

// Routes
router.post("/", upload.single("file"), createPublication);
router.get("/", getPublications);
router.get("/:id", getPublicationById);
router.patch("/:id", upload.single("file"), updatePublication);
router.delete("/:id", deletePublication);

export default router;
