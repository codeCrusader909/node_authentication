import userModel from './user.schema.js'
import {compareHashedPassword} from '../../utility/hashPassword.js'
import nodemailer from 'nodemailer';

export const userRegistrationRepo = async (userData) => {
    try {
      const newUser = new userModel(userData);
      await newUser.save();
      return { success: true, res: newUser };
    } catch (error) {
      // throw new Error("email duplicate");
      return { success: false, error: { statusCode: 400, msg: error } };
    }
  };
  export const userLoginRepo = async (userData) => {
    try {
      const { username, password } = userData;
      console.log(username)
      const user = await userModel.findOne({ email:username });
      if (!user) {
        return {
          success: false,
          error: { statusCode: 404, msg: "user not found" },
        };
      } else {
        let passwordValidation = await compareHashedPassword(
          password,
          user.password
        );
        if (passwordValidation) {
          return { success: true, res: user };
        } else {
          return {
            success: false,
            error: { statusCode: 400, msg: "invalid credentials" },
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: { statusCode: 400, msg: error },
      };
    }
  };
  export const getUserByEmail = async (email) => {
    try {
      const user = await userModel.findOne(email);
      if (!user) {
        return {
          success: false,
          error: { statusCode: 404, msg: "user not found" },
        };
      } else {
        return { success: true, res: user };
      }
    } catch (error) {
      return {
        success: false,
        error: { statusCode: 400, msg: error },
      };
    }
  };

  export const sendEmail = async (mailOptions) => {
    const transporter = nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
      }
    })
    try{
      await transporter.sendMail(mailOptions);
      return {
        success: true,
        res:'Scuccessfully email sent to '+mailOptions.to
      };
    }catch(err){
      console.log(err)
      return {
        success: false,
        error: { statusCode: 400, msg: err },
      };
    }
  }

  export const getUserByToken = async (resetToken) => {
    try {
      const user = await userModel.findOne({
        resetToken: resetToken
      });
      console.log(user)
      if (!user) {
        return {
          success: false,
          error: { statusCode: 404, msg: "user not found" },
        };
      } else {
        return { success: true, res: user };
      }
    } catch (error) {
      return {
        success: false,
        error: { statusCode: 400, msg: error },
      };
    }
  };