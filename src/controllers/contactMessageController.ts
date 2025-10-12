import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ContactMessage } from "../entities/ContactMessage";
import { asyncHandler } from "../utils/asyncHandler";

const contactMessageRepo = AppDataSource.getRepository(ContactMessage);

// POST /api/contact-messages
export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, serviceInterest, subject, email, phone, company, message } = req.body;
    if (!name || !serviceInterest || !subject || !company || !email || !message) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const contactMessage = contactMessageRepo.create({
      name,
      email,
      phone,
      company,
      serviceInterest,
      subject,
      message,
    });
    await contactMessageRepo.save(contactMessage);
    res.status(201).json({ message: "Message sent successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error sending message.", error: err });
  }
};

// GET /api/contact-messages (admin)
export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await contactMessageRepo.find({
      order: { createdAt: "DESC" },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages.", error: err });
  }
};

// PATCH /api/contact-messages/:id/responded
export const updateContactMessageResponded = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { responded } = req.body;
    const message = await contactMessageRepo.findOneBy({ id });
    if (!message)
      return res.status(404).json({ message: "Message not found." });
    message.responded = !!responded;
    await contactMessageRepo.save(message);
    res.json({ message: "Message updated.", responded: message.responded });
  } catch (err) {
    res.status(500).json({ message: "Error updating message.", error: err });
  }
};

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const message = await contactMessageRepo.findOne({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ message: "message not found" });
    }

    await contactMessageRepo.remove(message);

    res.json({ message: "message deleted successfully" });
  }
);