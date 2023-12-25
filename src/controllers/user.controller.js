import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User} from '../models/user.model.js'
import {uploadOnCludinary} from '../utils/Cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import {API_MESSAGE} from '../constants.js'
import jwt from "jsonwebtoken";

//register user
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
//login user 
const loginUser=asyncHandler(async (req,res)=>{
    const {email,username,password}=req.body
 

    if (!email && !username){
         res.status(400).json(new ApiResponse(400,{},"Username or email must be filled"))
    }
    const user=await User.findOne({ $or:[{username},{email}] })
    

    if(!user || user.length===0){
        res.status(400).json(new ApiResponse(400,{},"User may not exists"))
    }

   const isPasswordValid= await  user.isPasswordCorrect(password);
 
   if(!isPasswordValid){
    res.status(401).json(new ApiResponse(401,{},"Invalid User Credentials"))
   }
   const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    
   
   const loggedInUser=await User.findById(user._id).select("-password -refreshToken -__v")
   const options={
    httpOnly:true,
    secure:true
   }

   return res.
   status(200).
   cookie("accessToken",accessToken,options).
   cookie("refreshToken",refreshToken,options).
   json(
    new ApiResponse(200,{
        user:loggedInUser,refreshToken,accessToken,
    },
        "User LoggedIn SuccessFully"
    )
   )
})
//logout user
const logoutUser=asyncHandler(async (req,res)=>{
User.findByIdAndUpdate(
    req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },
        {
            new:true
        }
)
const options={
    httpOnly:true,
    secure:true
   }

   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},'User Logout SuccessFully'))

})
//refreshToken
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    console.log('refresh token',incomingRefreshToken)

    if(!incomingRefreshToken){
        res.status(401).json(new ApiResponse(401,{},"Invalid Refresh Token"))
    }


const decodedAccesToken=await jwt.verify(incomingRefreshToken,process.env.REFESH_TOKEN_SECRET)
console.log('decodedAccesToken from resfreshAccessToken',decodedAccesToken)

const user=await User.findById(decodedAccesToken._id)
if(!user){
    res.status(401).json(new ApiResponse(401,{},"Unauthorized Request!"))
}

if (user?.refreshToken!==incomingRefreshToken){
    res.status(401).json(new ApiResponse(401,{},"RefreshToken is Expaired or used!"))
}

const options={
    httpOnly:true,
    secure:true
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    console.log('after generation new refreshtoken',refreshToken)


    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{id:user?._id,refreshToken,accessToken},
         API_MESSAGE.REFRESH_ACCESS_TOKEN
        )
    )
})
//change password
const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword,confirmPassword}=req.body
    console.log("data from user",req?.user)
    const ss=typeof newPassword
    console.log(ss=="string")

    if(newPassword!==confirmPassword){
        res.status(400).json(new ApiResponse(400,{},"Password and confirm password must same"))
    }
    const user=await User.findById(req?.user?._id)
    if(!user){
        res.status(401).json(new ApiResponse(401,{},"Unauthrized Request"))
    }
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        res.status(400).json(new ApiResponse(400,{},"UserName or Passwor may wrong"))
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    res.json(
        new ApiResponse(200,{},"Password Successfully Changed!")
    )
})

//get current user

const getCurrentUser=asyncHandler(async(req,res)=>{
    res.json(
        new ApiResponse(200,req?.user,"Password Successfully Changed!")
    )
})
//update user details
const updateUserDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email){
        res.json(
            new ApiResponse(200,{},"All fields required!")
        ) 
    }

    const user=await User.findByIdAndUpdate(req.user?._id
        ,
        {$set:{fullname:fullname,email:email}
            },
        {new:true}
        ).select("-password")

        res.json(
            new ApiResponse(200,user,"User Successfully Updated")
        )
})

const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        res.json(new ApiResponse(400,{},'Avatar file missing'))
    }
    const avatar=await uploadOnCludinary(avatarLocalPath)
    if(!avatar.url){
        res.json(new ApiResponse(400,{},'While uploading avatar on c..'))
    }

    const user=User.findByIdAndUpdate(req.user._id,{$set:{avatar:avatar.url}},{new:true}).select("-password")

})

//generate access and refresh token
const generateAccessAndRefreshToken=async (userId)=>{   
try {
    const user=await User.findById({_id:userId})
    const accessToken=await user.generateAccessToken()
    const refreshToken=await user.generateRefereshToken()
    user.refreshToken=refreshToken
    user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
} catch (error) {
    console.log('error generte in generateAccessAndRefreshToken',error)
}

}



export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserDetails,updateAvatar}