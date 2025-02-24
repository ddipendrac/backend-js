import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
    
  }
}

// gets called from user routes, handles user route
const registerUser = asyncHandler(async (req, res)=> {
  //1. get user detail frontend(postman)
  //2. validation - not empty
  //3. check if user already exist: username, email
  //4. check for images, check for avatar
  //5. upload them to cloudinary, avatar
  //6. create user object - create entry in db
  //7. remove password and refresh token field from response
  //8. check for user creation
  //9. return res

  const { fullName, email, username, password } = req.body
  console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }] // check if both exist
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist")
  }
  // multer has the file so we are using multer method file to get path (avatar[0] has that path)
  // console.log(req.files);
  
  const 
  avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  //mongoDB attaches _id to each data
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // what we don't need
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data(get data)
  // username or email(use this)
  // find user
  // password check
  // access and refresh token
  // send cookie(res)

  const { email, username, password } = req.body

  if (!username || !email) {
    throw new ApiError(400, "username or password is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  // User is mongoose method
  // user is my created method
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials"); 
  }

  
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

 const loggedInUser = await User.findById(user._id).
 select("-password -refreshToken")

 const options = {
  httpOnly: true,
  secure: true
 }

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser, accessToken,
      refreshToken
    },
    "User logged In Successfully"
  )
 )

})

const loggoutUser = asyncHandler(async(req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined
        },
        {
          new: true
        }
      }
    )

    const options = {
      httpOnly: true,
      secure: true
     }

     return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"))
})

export {
  registerUser,
  loginUser,
  loggoutUser
}