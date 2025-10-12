import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TeamMember } from "../entities/Team";
import { User } from "../entities/User";
import { uploadImage } from "../utils/uploadImage";

interface MulterRequest extends Request {
  file?: any;
}

const teamRepo = AppDataSource.getRepository(TeamMember);
const userRepo = AppDataSource.getRepository(User);

export const getAllTeamMembers = async (req: Request, res: Response) => {
  const team = await teamRepo.find({
    order: { order: "ASC" },
  });
  res.json(team);
};

export const getTeamMemberById = async (req: Request, res: Response) => {
  const member = await teamRepo.findOne({
    where: { id: req.params.id },
  });
  if (!member)
    return res.status(404).json({ message: "Team member not found" });
  res.json(member);
};

export const createTeamMember = async (req: MulterRequest, res: Response) => {
  try {
    const { name, position, linkedin } = req.body;
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }
  
    // Get the next order value
    const maxOrder = (await teamRepo.maximum("order")) || 0;

    const member = teamRepo.create({
      name,
      position,
      image: imageUrl,
      linkedin,
      order: maxOrder + 1, // <-- This sets the new member's order to the next available value
    });
    await teamRepo.save(member);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Error creating team member", error: err });
  }
};

export const updateTeamMember = async (req: MulterRequest, res: Response) => {
  try {
    const member = await teamRepo.findOne({
      where: { id: req.params.id },
    });
    if (!member)
      return res.status(404).json({ message: "Team member not found" });
    const { name, position, linkedin } = req.body;
    if (name) member.name = name;
    if (position) member.position = position;
    if (linkedin) member.linkedin = linkedin;
    if (req.file) {
      member.image = await uploadImage(req.file.path);
    }
    await teamRepo.save(member);
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Error updating team member", error: err });
  }
};

export const deleteTeamMember = async (req: Request, res: Response) => {
  try {
    const member = await teamRepo.findOneBy({ id: req.params.id });
    if (!member)
      return res.status(404).json({ message: "Team member not found" });
    await teamRepo.remove(member);
    res.json({ message: "Team member deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting team member", error: err });
  }
};

export const swapTeamMemberOrder = async (req: Request, res: Response) => {
  try {
    const { memberId1, memberId2 } = req.body;
    if (!memberId1 || !memberId2) {
      return res.status(400).json({ message: "Both member IDs are required" });
    }
    if (memberId1 === memberId2) {
      return res.status(400).json({ message: "Member IDs must be different" });
    }
    const member1 = await teamRepo.findOneBy({ id: memberId1 });
    const member2 = await teamRepo.findOneBy({ id: memberId2 });
    if (!member1 || !member2) {
      return res
        .status(404)
        .json({ message: "One or both team members not found" });
    }
    // Swap their order values
    const tempOrder = member1.order;
    member1.order = member2.order;
    member2.order = tempOrder;
    await teamRepo.save([member1, member2]);
    res.json({ message: "Team member order swapped successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error swapping team member order", error: err });
  }
};

export const reorderTeamMembers = async (req: Request, res: Response) => {
  try {
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "Member IDs array is required" });
    }
    // Update each member's order based on their position in the array
    const updatePromises = memberIds.map((memberId: string, index: number) => {
      return teamRepo.update({ id: memberId }, { order: index + 1 });
    });
    await Promise.all(updatePromises);
    res.json({ message: "Team members reordered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error reordering team members", error: err });
  }
};
