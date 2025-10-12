import { Request, Response } from "express";
import { Publication } from "../entities/Publication";
import { uploadImage } from "../utils/uploadImage"; 
import { AppDataSource } from "../data-source";
import { asyncHandler } from "../utils/asyncHandler";

const publicationRepo = AppDataSource.getRepository(Publication);

// 🟩 Create a new publication with file upload
export const createPublication = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, type, date, isActive = true } = req.body;

  if (!title || !description || !type || !date) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, description, type, and date.",
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
    date,
    isActive,
    fileUrl,
    fileType,
  });

  const savedPublication = await publicationRepo.save(publication);

  res.status(201).json({
    success: true,
    message: "Publication created successfully",
    data: savedPublication,
  });
});

// 🟦 Get all publications
export const getPublications = asyncHandler(async (_req: Request, res: Response) => {
  const publications = await publicationRepo.find({
    order: { date: "DESC" },
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
