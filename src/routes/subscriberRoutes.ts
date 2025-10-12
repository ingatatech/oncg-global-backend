import { Router } from "express"
import { getSubscribers, subscribe, unsubscribe, unsubscribeById } from "../controllers/subscriberController"
import { validate } from "../middlewares/validation"
import { body } from "express-validator"

const router = Router()

router.post(
  "/subscribe",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  subscribe,
)

router.post(
  "/unsubscribe",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  unsubscribe,
)

router.get("/", getSubscribers)
router.patch("/:id/unsubscribe", unsubscribeById)
export default router


