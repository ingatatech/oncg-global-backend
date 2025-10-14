import { Router } from "express";
import * as teamController from "../controllers/teamController";

import { authAsyncHandler } from "../utils/asyncHandler";
import { auth } from "../middlewares/auth";
import { upload } from "../utils/multer";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  // createLeaderValidation,
  teamController.createTeamMember
);

router.get("/", teamController.getAllTeamMembers);

router.get("/:id", teamController.getTeamMemberById);

router.patch(
  "/:id",
  upload.single("image"),
  teamController.updateTeamMember
);

router.delete("/:id", teamController.deleteTeamMember);
router.put("/reorder", authAsyncHandler(teamController.reorderTeamMembers));

export default router;
