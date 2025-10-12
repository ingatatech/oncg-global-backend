import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Insight } from "../entities/Insight";
import { User } from "../entities/User";
import { uploadImage } from "../utils/uploadImage";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";
import { Subscriber } from "../entities/Subscriber";
import { sendInsightNotificationEmail } from "../utils/emailService";

const insightRepo = AppDataSource.getRepository(Insight);
const userRepo = AppDataSource.getRepository(User);
const subscriberRepo = AppDataSource.getRepository(Subscriber);

interface MulterRequest extends Request {
  file?: any;
}

// Get all insights with optional filtering and pagination
export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const {
    authorId,
    isActive,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  const queryBuilder = insightRepo
      .createQueryBuilder("insight")
      .leftJoinAndSelect("insight.author", "author");

  if (authorId) {
    queryBuilder.andWhere("insight.authorId = :authorId", { authorId });
  }

  if (isActive !== undefined) {
    queryBuilder.andWhere("insight.isActive = :isActive", { isActive: isActive === "true" });
  }



  if (search) {
    queryBuilder.andWhere(
      "(insight.title ILIKE :search OR insight.content ILIKE :search OR insight.excerpt ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Apply sorting
  const validSortFields = ["title", "viewCount", "displayOrder", "createdAt"];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : "createdAt";
  const order = sortOrder === "desc" ? "DESC" : "ASC";
  queryBuilder.orderBy(`insight.${sortField}`, order);

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [insights, total] = await queryBuilder.getManyAndCount();

  res.json({
    insights,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get a single insight by ID
export const getInsight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const insight = await insightRepo.findOne({
    where: { id },
    relations: ["author"],
  });

  if (!insight) {
    return res.status(404).json({ message: "Insight not found" });
  }

  // Increment view count
  insight.viewCount += 1;
  await insightRepo.save(insight);

  res.json(insight);
});

// Create a new insight
export const createInsight = authAsyncHandler(async (req: MulterRequest, res: Response) => {
  const {
    title,
    content,
    authorId,
    isActive = true,
  } = req.body;

  // Handle image upload if present
  let imageUrl = "";
  if (req.file) {
    imageUrl = await uploadImage(req.file.path);
  }
  const maxOrder = (await insightRepo.maximum("displayOrder")) || 0;

  const insight = insightRepo.create({
    title,
    content,
    isActive,
    displayOrder:maxOrder+1,
    image: imageUrl,
  });


  // Set author if provided
  if (authorId) {
    const author = await userRepo.findOne({ where: { id: authorId } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    insight.author = author;
  }

  const savedInsight = await insightRepo.save(insight);

  // Notify active subscribers
  const subscribers = await subscriberRepo.find({ where: { isActive: true } });
  if (subscribers.length > 0) {
    const safeTitle = savedInsight.title;
    const preview = (savedInsight.content || "").slice(0, 180);
    await Promise.all(
      subscribers.map((s) =>
        sendInsightNotificationEmail({
          email: s.email,
          title: safeTitle,
          preview,
          link: `${process.env.FRONTEND_URL || "https://oncg.com"}/insights/${savedInsight.id}`,
        }),
      ),
    );
  }

  res.status(201).json(savedInsight);
});

// Update an insight
export const updateInsight = authAsyncHandler(async (req: MulterRequest, res: Response) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const insight = await insightRepo.findOne({ where: { id } });
  if (!insight) {
    return res.status(404).json({ message: "Insight not found" });
  }

  // Handle image upload if present
    if (req.file) {
    updateData.image = await uploadImage(req.file);
  }



  // Update author if provided
  if (updateData.authorId) {
    const author = await userRepo.findOne({ where: { id: updateData.authorId } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    updateData.author = author;
    delete updateData.authorId;
  }

  Object.assign(insight, updateData);
  const updatedInsight = await insightRepo.save(insight);

  // Fetch the complete insight with relations
  const completeInsight = await insightRepo.findOne({
    where: { id },
    relations: ["author"],
  });

  res.json(completeInsight);
});

// Delete an insight
export const deleteInsight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const insight = await insightRepo.findOne({ where: { id } });
  if (!insight) {
    return res.status(404).json({ message: "Insight not found" });
  }

    await insightRepo.remove(insight);
  res.json({ message: "Insight deleted successfully" });
});

// Get insights by author
export const getInsightsByAuthor = asyncHandler(async (req: Request, res: Response) => {
  const { authorId } = req.params;

  const author = await userRepo.findOne({ where: { id: authorId } });
  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  const insights = await insightRepo.find({
    where: { author: { id: authorId } },
    relations: [ "author"],
    order: { createdAt: "DESC" },
  });

  res.json(insights);
});

// Get popular insights (by view count)
export const getPopularInsights = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const insights = await insightRepo.find({
    where: { isActive: true },
    relations: [ "author"],
    order: { viewCount: "DESC", createdAt: "DESC" },
    take: Number(limit),
  });

  res.json(insights);
});

// Get recent insights
export const getRecentInsights = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const insights = await insightRepo.find({
    where: { isActive: true },
    relations: [ "author"],
    order: { createdAt: "DESC" },
    take: Number(limit),
  });

  res.json(insights);
});


// Update insight display order
export const updateInsightOrder = asyncHandler(async (req: Request, res: Response) => {
  const { insights } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(insights)) {
    return res.status(400).json({ message: "Insights must be an array" });
  }

  const updatePromises = insights.map(({ id, displayOrder }) =>
    insightRepo.update(id, { displayOrder })
  );

  await Promise.all(updatePromises);

  res.json({ message: "Display order updated successfully" });
});

// Toggle insight active status
export const toggleInsightStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const insight = await insightRepo.findOne({ where: { id } });
  if (!insight) {
    return res.status(404).json({ message: "Insight not found" });
  }

  insight.isActive = !insight.isActive;
  await insightRepo.save(insight);

  res.json({ message: `Insight ${insight.isActive ? "activated" : "deactivated"} successfully` });
});


