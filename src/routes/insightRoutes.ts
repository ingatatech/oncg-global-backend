import { Router } from "express";
import {
  getInsights,
  getInsight,
  createInsight,
  updateInsight,
  deleteInsight,
  getInsightsByAuthor,
  getPopularInsights,
  getRecentInsights,
  updateInsightOrder,
  toggleInsightStatus,
} from "../controllers/insightController";

import { upload } from "../utils/multer";
import { auth } from "../middlewares/auth";

const router = Router();

// Get all insights with filtering and pagination
router.get("/",  getInsights);

// Get a single insight by ID
router.get("/:id",  getInsight);

// Create a new insight
router.post("/", upload.single("image"), auth , createInsight);

// Update an insight
router.patch("/:id", upload.single("image"), auth , updateInsight);

// Delete an insight
router.delete("/:id", auth , deleteInsight);

// Get insights by author
router.get("/author/:authorId",  getInsightsByAuthor);

// Get popular insights
router.get("/popular/all",  getPopularInsights);

// Get recent insights
router.get("/recent/all",  getRecentInsights);


// Update insight display order
router.patch("/order",auth , updateInsightOrder);

// Toggle insight active status
router.patch("/:id/toggle-status", auth , toggleInsightStatus);


export default router;
