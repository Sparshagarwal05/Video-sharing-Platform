import dotenv from 'dotenv'
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
dotenv.config({
    path: "./.env"
})


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        console.log("Error detected", error);
        fs.unlinkSync(localFilePath) // remove locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async (url) => {
    try {
        const public_id = url.split("/").pop().split(".")[0]
        console.log(public_id);
        await cloudinary.uploader.destroy(public_id).then(res => console.log(res)).catch(err => console.log(err))
    } catch (error) {
        console.log("Error deleting", error);
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }