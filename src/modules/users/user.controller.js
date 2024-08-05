import { getUserByEmail, sendEmail, userRegistrationRepo,getUserByToken } from "./user.repository.js"
import crypto from 'crypto'
import {compareHashedPassword, hashPassword} from '../../utility/hashPassword.js'

//User registration
export const userRegistration = async (req, res, next) => {
    let { password } = req.body;
    const hashedPassword = await hashPassword(password);
    if(hashedPassword.success){
        password = hashedPassword.res
        const resp = await userRegistrationRepo({ ...req.body, password });
        if (resp.success) {
            res.render('login')

        } else {
            res.render('login', {errorMessage:resp.error.msg})
        }
    }else{
        res.render('register', {successMessage:'', errorMessage:hashedPassword.res})
    }
    
  };

//Send reset password
export const sendResetPassword = async (req, res) => {
    const { email } = req.body;
    const users = await getUserByEmail({email})
    if (!users.success) {
        res.render('reset-password', {errorMessage:"User not found", successMessage:""})
    }else{
        const user = users.res
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        
        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: 'codingninjas2k16@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `To reset your password, please click the following link: ${resetUrl}`
        };
        await user.save()
        const sendEmail1 = await sendEmail(mailOptions)
        if(sendEmail1.success){
            res.render('reset-password', {successMessage:"Password reset email sent", errorMessage:""})
        }else{
            res.render('reset-password', {successMessage:"", errorMessage:sendEmail1.error})
        }
    }

}

export const forgotPassword = async (req, res) => {
    const { newPassword } = req.body;
    const resetToken = req.query.token
    let email;
    const users = await getUserByToken(resetToken)
    var user
    if(users.success){
        user = users.res
    }
    if (users.success && user.resetToken === resetToken && user.resetTokenExpiry > Date.now()) {
        email =user.email;
    }
    if (!email) {
        return res.status(400).send('Password reset token is invalid or has expired');
    }else{
        const hashedPassword = await hashPassword(newPassword);
        if(hashedPassword.success){
            user.password = hashedPassword.res
            user.resetToken = "";
            user.resetTokenExpiry = "";
            await user.save()
            res.render('login', {successMessage:'Password has been reset', errorMessage:""})
        }else{
            res.render('forgot_password', {successMessage:'', errorMessage:hashPassword.res})
        }
      
    }

}

export const resetPassword = async (req, res) => {
    const { newPassword, oldPassword } = req.body;
    const users = await getUserByEmail({email:req.user.email})
    if (!users.success) {
        res.render('reset', {errorMessage:"User not found", successMessage:""})
    }else{
        const user = users.res
        let passwordValidation = await compareHashedPassword(
            oldPassword,
            user.password
        );
        if (passwordValidation) {
            const hashedPassword = await hashPassword(newPassword);
            if(hashedPassword.success){
                const new_password_enc = hashedPassword.res
                user.password = new_password_enc
                await user.save()
            }else{
                res.render('reset', {successMessage:'', errorMessage:hashedPassword.res})
            }
            
            res.render('reset', {successMessage:'Password reset successfully', errorMessage:""})
        }else{
            res.render('reset', {successMessage:'', errorMessage:"Not a valid password"})
        }
    }
}

