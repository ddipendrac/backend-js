import { Router } from "express"
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  changeCurrentPassword, 
  getCurrentUser, 
  updateAccoutDetails, 
  updateUserAvatar, 
  updateUserCoverImage, 
  getUserChannelProfile, 
  getWatchHistory
} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

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
  registerUser // from user controller
)

router.route("/login").post(loginUser)

// secured routes
// verifyJWT: check if user is logged in or not
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccoutDetails) // only update some

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) // upload: multer
router.route("/cover-image").path(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, 
  getUserChannelProfile
)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router