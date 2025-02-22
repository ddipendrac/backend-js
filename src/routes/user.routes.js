import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

// gets called from app.js, has route /register, then has post method that calls registerUser controller
router.route("/register").post(
  // use multer middleware just before registering
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser

)

export default router