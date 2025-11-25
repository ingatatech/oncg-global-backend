import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { deleteOTP, deleteResetToken, getOTP, storeOTP, storeResetToken, verifyResetToken } from '../config/redis.config';
import { sendOTPEmail, sendPasswordResetConfirmationEmail } from '../utils/emailService';
const userRepo = AppDataSource.getRepository(User);
// Generate a random 4-digit OTP
const generateOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

// Request password reset (send OTP)
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body

    // Check if user exists
    const user = await userRepo.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      })
    }

    // Generate OTP and store it
    const otp = generateOTP()
    const expirySeconds = 300 // 5 minutes
    await storeOTP(email, otp, expirySeconds)

    // Try to send email with OTP
     const appData = {
      name: `${user.name}`,
      email: user.email,
      otp:otp
    };
  sendOTPEmail(appData)


    // For development or if email was sent successfully
    return res.status(200).json({
      success: true,
      message: 
         'OTP has been sent to your email address',
    })
  } catch (error) {
    console.error('Error in requestPasswordReset:', error)
    return res.status(500).json({
      success: false,
      message: 'Error requesting password reset',
      error: error instanceof Error ? error.message : error,
    })
  }
}

// Verify OTP
export const verifyOTP = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp } = req.body

    // Check if user exists
    const user = await userRepo.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      })
    }

    // Get stored OTP from Redis
    const storedOTP = await getOTP(email)

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or was not requested',
      })
    }

    // Verify OTP
    if (storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    // OTP is valid, generate a reset token
    const resetToken = uuidv4()

    // Store reset token in Redis (expires in 15 minutes)
    await storeResetToken(email, resetToken, 900)

    // Delete the OTP as it's no longer needed
    await deleteOTP(email)

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    })
  } catch (error) {
    console.error('Error in verifyOTP:', error)
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error instanceof Error ? error.message : error,
    })
  }
}

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, resetToken, newPassword } = req.body

    // Check if user exists
    const user = await userRepo.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      })
    }

    // Verify reset token
    const isValidToken = await verifyResetToken(email, resetToken)
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      })
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user's password
if(newPassword){
  user.password =hashedPassword
}
    await userRepo.save(user)

    // Delete the reset token as it's no longer needed
    await deleteResetToken(email)
    // Send confirmation email
       const appData = {
      name: `${user.name}`,
      email: user.email,
    };
     sendPasswordResetConfirmationEmail(appData)
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error instanceof Error ? error.message : error,
    })
  }
}
