import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCludinary} from '../utils/Cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    //get details from frontend
    //validattion
    //save into db if exists then update or insert
    //upload on cloudinary 
    //return res
    const {username,email,fullname,password}=req.body
if(email===""){
    throw new ApiError(400,"fullname is required")
}
if([email,username,fullname,password].some((field)=>field?.trim()=="")){
    throw new ApiError(400,"all fields is required")
}
const existedUser=await User.findOne({$or:[{username},{email}]})
if(existedUser){
    throw new ApiError(409,"User with username or email already exist!")
}

const avatarLocalPath=req?.files.avatar[0]?.path;
let coverImageLocalPath;
if(eq?.files && Array.isArray(req?.files.coverImage) && req?.files.coverImage.length>0){
    coverImageLocalPath=req?.files.coverImage[0]?.path
}
 

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required!")
}
const avatar=await uploadOnCludinary(avatarLocalPath)
const coverImage=await uploadOnCludinary(coverImageLocalPath)
  

if(!avatar){
    throw new ApiError(400,"Avatar file is required!")
}

const user=await User.create({
    username:username.toLowerCase(),
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    fullname
})

const createUser=await User.findById(user._id).select("-password -refreshToken")
if(!createUser){
    throw new ApiError(500,"when we are registering user having some issue !!!")
}

res.status(201).json(
    new ApiResponse(200,createUser,"registered user scuccesfully")
)
   
    
})

export {registerUser}