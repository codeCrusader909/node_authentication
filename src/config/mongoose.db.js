import dotenv from 'dotenv'
dotenv.config()
import mongoose from "mongoose";

const DB =process.env.MONGODB

export const db = async() => {
    try{
        mongoose.connect(DB)
        console.log("DB connected")
    }catch(err){
        console.log(err)
    }
}