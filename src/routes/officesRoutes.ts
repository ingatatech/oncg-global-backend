import { Router } from "express";
import { body } from "express-validator";
import {
  createOffice,
  getAllOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
} from "../controllers/officesController";
import { auth } from "../middlewares/auth";


const router = Router();

// ✅ Validation middleware for creating/updating an office
const officeValidation = [
  body("country").notEmpty().withMessage("Country is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("employees")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Employees must be a positive integer"),
  body("isHeadquarters").optional().isBoolean(),
  body("isActive").optional().isBoolean(),
];

// 🏢 Create a new office
router.post("/", auth, officeValidation, createOffice);

// 📋 Get all offices
router.get("/", getAllOffices);

// 🔍 Get a single office by ID
router.get("/:id", getOfficeById);

// ✏️ Update an office
router.put("/:id", auth, officeValidation, updateOffice);

// 🗑️ Delete an office
router.delete("/:id", auth, deleteOffice);

export default router;
