import { Request, Response } from "express"
import { AppDataSource } from "../data-source"
import { Subscriber } from "../entities/Subscriber"
import { asyncHandler } from "../utils/asyncHandler"

const subscriberRepo = AppDataSource.getRepository(Subscriber)

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" })
  }

  const existing = await subscriberRepo.findOne({ where: { email } })
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true
      await subscriberRepo.save(existing)
    }
    return res.json({ message: "Already subscribed" })
  }

  const sub = subscriberRepo.create({ email })
  const saved = await subscriberRepo.save(sub)
  res.status(201).json({ id: saved.id, email: saved.email })
})

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" })
  }

  const existing = await subscriberRepo.findOne({ where: { email } })
  if (!existing) {
    return res.status(404).json({ message: "Subscriber not found" })
  }

  existing.isActive = false
  await subscriberRepo.save(existing)
  res.json({ message: "Unsubscribed" })
})

export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  // Optional: filter by active subscribers only
  const { active } = req.query

  let subscribers
  if (active === "true") {
    subscribers = await subscriberRepo.find({ where: { isActive: true } })
  } else {
    subscribers = await subscriberRepo.find()
  }

  res.json(subscribers)
})
export const unsubscribeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const existing = await subscriberRepo.findOne({ where: { id:id } })
  if (!existing) {
    return res.status(404).json({ message: "Subscriber not found" })
  }

  existing.isActive = false
  await subscriberRepo.save(existing)

  res.json({ message: `Unsubscribed ${existing.email}` })
})