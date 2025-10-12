import { createClient } from 'redis'
import logger from '../utils/logger'

const { REDIS_URL, REDIS_PWD } = process.env

const redisClient = createClient({
  url: REDIS_URL,
  password: REDIS_PWD,
})

redisClient.on('connect', () => {
  logger.info('Redis client connected...')
})

redisClient.on('ready', () => {
  logger.success('Redis client connected and ready to use...')
})

redisClient.on('error', (err: Error) => {
  logger.error('Redis Error 💥: ' + err.message)
})

redisClient.on('end', () => {
  logger.warn('Redis client connection closed...')
})
;(async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    logger.error('Failed to connect to Redis: ' + (error as Error).message)
  }
})()

export const setToken = async (key: string, value: string): Promise<void> => {
  console.log(key, value)
  await redisClient.set(key, value)
}

export const deleteToken = async (key: string): Promise<void> => {
  await redisClient.del(key)
}

export const getToken = async (key: string): Promise<string | null> => {
  return await redisClient.get(key)
}

// Store OTP with expiration (in seconds)
export const storeOTP = async (
  email: string,
  otp: string,
  expiresIn = 300
): Promise<void> => {
  const key = `otp:${email}`
  // Use the correct syntax for the newer Redis client
  await redisClient.set(key, otp, { EX: expiresIn })
}

// Get OTP for verification
export const getOTP = async (email: string): Promise<string | null> => {
  const key = `otp:${email}`
  return await redisClient.get(key)
}

// Delete OTP after verification
export const deleteOTP = async (email: string): Promise<void> => {
  const key = `otp:${email}`
  await redisClient.del(key)
}

// Store reset token after OTP verification
export const storeResetToken = async (
  email: string,
  token: string,
  expiresIn = 900
): Promise<void> => {
  const key = `reset:${email}`
  // Use the correct syntax for the newer Redis client
  await redisClient.set(key, token, { EX: expiresIn })
}

// Verify reset token
export const verifyResetToken = async (
  email: string,
  token: string
): Promise<boolean> => {
  const key = `reset:${email}`
  const storedToken = await redisClient.get(key)
  return storedToken === token
}

// Delete reset token after password reset
export const deleteResetToken = async (email: string): Promise<void> => {
  const key = `reset:${email}`
  await redisClient.del(key)
}

export default redisClient
