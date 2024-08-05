import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    name:String,
    email:{type:String},
    password:{type:String},
    resetTokenExpiry:{type:String},
    resetToken:{type:String}
})

const userModel =  new mongoose.model('users', userSchema)

export default userModel