import { Router } from "express";
import * as userController from "../controllers/userController";
import { auth } from "../middlewares/auth";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";
import { requestPasswordReset, resetPassword, verifyOTP } from "../controllers/forgotPasswordController";

const router = Router();

router.post("/register", asyncHandler(userController.register));
router.post("/login", asyncHandler(userController.login));
router.get("/profile", auth, authAsyncHandler(userController.getProfile));
router.patch("/profile", auth, authAsyncHandler(userController.updateProfile));
router.patch(
  "/change-password",
  auth,
  authAsyncHandler(userController.changePassword)
);
// Request password reset (send OTP)
router.post(
  '/request-reset',
  requestPasswordReset
)

// Verify OTP
router.post('/verify-otp', verifyOTP)

// Reset password with new password
router.post('/reset', resetPassword)

export default router;
