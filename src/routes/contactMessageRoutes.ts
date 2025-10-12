import express from "express"
import * as contactMessageController from "../controllers/contactMessageController"
import { asyncHandler } from "../utils/asyncHandler"

const contactMessageRouter = express.Router()

// Public: Send a contact message
contactMessageRouter.post(
  "/",
  asyncHandler(contactMessageController.createContactMessage),
)

// Admin: Get all contact messages
contactMessageRouter.get("/", asyncHandler(contactMessageController.getContactMessages))

// Admin: Delete a contact message
contactMessageRouter.delete("/:id", contactMessageController.deleteMessage)

// Admin: Update the responded status of a contact message
contactMessageRouter.patch(
  "/:id",
  asyncHandler(contactMessageController.updateContactMessageResponded),
)

export default contactMessageRouter
