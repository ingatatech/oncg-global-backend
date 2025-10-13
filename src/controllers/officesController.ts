import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Office } from "../entities/Offices";
import { validationResult } from "express-validator";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";
const officeRepo = AppDataSource.getRepository(Office);

// ✅ Create a new office
export const createOffice = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { country, city, address, phone, email, isHeadquarters, isActive } = req.body;

  // Prevent duplicate email
  const existingOffice = await officeRepo.findOne({ where: { email } });
  if (existingOffice) {
    return res.status(400).json({
      success: false,
      message: "Office with this email already exists",
    });
  }

  const office = officeRepo.create({
    country,
    city,
    address,
    phone,
    email,
    isHeadquarters,
    isActive,
  });

  const savedOffice = await officeRepo.save(office);

  res.status(201).json({
    success: true,
    message: "Office created successfully",
    data: savedOffice,
  });
});

// ✅ Get all offices
export const getAllOffices = authAsyncHandler(async (req: Request, res: Response) => {
  const offices = await officeRepo.find({
    order: { createdAt: "DESC" },
  });

  res.status(200).json({
    success: true,
    count: offices.length,
    data: offices,
  });
});

// ✅ Get a single office by ID
export const getOfficeById = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const office = await officeRepo.findOne({ where: { id } });

  if (!office) {
    return res.status(404).json({
      success: false,
      message: "Office not found",
    });
  }

  res.status(200).json({
    success: true,
    data: office,
  });
});

// ✅ Update an office
export const updateOffice = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const office = await officeRepo.findOne({ where: { id } });

  if (!office) {
    return res.status(404).json({
      success: false,
      message: "Office not found",
    });
  }

  Object.assign(office, req.body);

  const updatedOffice = await officeRepo.save(office);

  res.status(200).json({
    success: true,
    message: "Office updated successfully",
    data: updatedOffice,
  });
});

// ✅ Delete an office
export const deleteOffice = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const office = await officeRepo.findOne({ where: { id } });

  if (!office) {
    return res.status(404).json({
      success: false,
      message: "Office not found",
    });
  }

  await officeRepo.remove(office);

  res.status(200).json({
    success: true,
    message: "Office deleted successfully",
  });
});
