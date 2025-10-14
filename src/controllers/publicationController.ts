import { Request, Response } from "express";
import { Publication } from "../entities/Publication";
import { uploadImage } from "../utils/uploadImage"; 
import { AppDataSource } from "../data-source";
import { asyncHandler } from "../utils/asyncHandler";
import { sendInsightNotificationEmail } from "../utils/emailService";
import { Subscriber } from "../entities/Subscriber";

const publicationRepo = AppDataSource.getRepository(Publication);
const subscriberRepo = AppDataSource.getRepository(Subscriber);

// 🟩 Create a new publication with file upload
export const createPublication = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, type,  isActive = true } = req.body;

  if (!title || !description || !type) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, description, type.",
    });
  }

  let fileUrl = "";
  let fileType = "";

  if (req.file) {
    const uploadedFile = await uploadImage(req.file.path);
    fileUrl = uploadedFile;
    fileType = req.file.mimetype;
  }

  const publication = publicationRepo.create({
    title,
    description,
    type,
    isActive,
    fileUrl,
    fileType,
  });

  const savedPublication = await publicationRepo.save(publication);
  const subscribers = await subscriberRepo.find({ where: { isActive: true } });
  if (subscribers.length > 0) {
    const safeTitle = savedPublication.title;
    const preview = (savedPublication.description || "").slice(0, 180);
    await Promise.all(
      subscribers.map((s) =>
        sendInsightNotificationEmail({
          email: s.email,
          title: safeTitle,
          preview,
          link: `${process.env.FRONTEND_URL || "https://oncgglobal.com"}/insights`,
        }),
      ),
    );
  }
  res.status(201).json({
    success: true,
    message: "Publication created successfully",
    data: savedPublication,
  });
});

// 🟦 Get all publications
export const getPublications = asyncHandler(async (_req: Request, res: Response) => {
  const publications = await publicationRepo.find({
    order: { createdAt: "DESC" },
  });
  res.status(200).json({ success: true, data: publications });
});

// 🟨 Get single publication
export const getPublicationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const publication = await publicationRepo.findOne({ where: { id } });

  if (!publication) {
    return res.status(404).json({ success: false, message: "Publication not found" });
  }

  res.status(200).json({ success: true, data: publication });
});

// 🟧 Update publication
export const updatePublication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const publication = await publicationRepo.findOne({ where: { id } });

  if (!publication) {
    return res.status(404).json({ success: false, message: "Publication not found" });
  }

  // Upload new file if provided
  if (req.file) {
    const uploadedFile = await uploadImage(req.file.path);
    publication.fileUrl = uploadedFile;
    publication.fileType = req.file.mimetype;
  }

  Object.assign(publication, req.body);

  const updated = await publicationRepo.save(publication);
  res.status(200).json({
    success: true,
    message: "Publication updated successfully",
    data: updated,
  });
});

// 🟥 Delete publication
export const deletePublication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const publication = await publicationRepo.findOne({ where: { id } });

  if (!publication) {
    return res.status(404).json({ success: false, message: "Publication not found" });
  }

  await publicationRepo.remove(publication);
  res.status(200).json({ success: true, message: "Publication deleted successfully" });
});
