import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true
// });

cloudinary.config({
    cloud_name: 'dpndddg8c',
    api_key: '131496396883771',
    api_secret: 'q7sJBffBMmyk2Xn_TOy2D6P39rY',
    secure: true,
  });



const uploadOnCludinary=async(localFilePath)=>{
    try
    {
     
        console.log({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
          })
        if(!localFilePath) return null
        //upload file on cloudinary
        console.log(localFilePath)
       const res=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"},(err,result)=>{
        console.log(err,result)
       })
       console.log('file upload res',res)
       fs.unlinkSync(localFilePath)
        //file has uploaded successfully
        console.log('file uploaded successfully',res.url)
        return res;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
 //remove file
 console.log(error)
return null
    }
}

export {uploadOnCludinary}


