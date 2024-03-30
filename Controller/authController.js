// import the packages
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import { config } from 'dotenv'
config()
import crypto from 'crypto'


// import the files 
import User from '../models/userModel.js'
import Apperror from '../utils/erorUtils.js'
import sendEmail from '../utils/sendEmail.js'

const cookieOption = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 1000, //for the 7 days login token
    secure: true
}
const registerUser = async (req, res, next) => {
    const { fullname, email, password } = req.body
    try {
        if (!fullname || !email || !password) {
            return next(new Apperror('All fields are required', 400))
        }

        const userExist = await User.findOne({ email })
        if (userExist) {
            return next(new Apperror("Email already exist", 400))
        }

        const user = await User.create({
            email,
            fullname,
            password,
            avatar: {
                public_id: "",
                secure_url: ""
            }
        })

        if (!user) {
            return next(new Apperror("User registration Failed", 400))
        }

        // Upload the avatar Image

        console.log(req.file)
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "avatars",
                    width: 150,
                    height: 150,
                    crop: "fill",
                    gravity: "faces",
                })
                if (result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url = result.secure_url

                    // remove the file from the local server 
                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error) {
                return next(new Apperror("Image upload failed" || error, 500))
            }
        }

        await user.save()
        const token = await user.generateJwttoken();
        user.password = undefined
        res.cookie('token', token, cookieOption)

        res.status(200).json({
            success: true,
            msg: "User registered successfully",
            user
        })
    }
    catch (error) {

        res.status(400).json({
            success: false,
            msg: "User registration failed"
        })
    }
}
// const registerAdmin = async (req, res, next) => {
//     const { fullname, email, password } = req.body
//     console.log(fullname, email, password)
//     try {
//         if (!fullname || !email || !password) {
//             return next(new Apperror('All fields are required', 400))
//         }

//         const userExist = await User.findOne({ email })
//         if (userExist) {
//             return next(new Apperror("Email already exist", 400))
//         }

//         const user = await User.create({
//             email,
//             fullname,
//             password,
//             avatar: {
//                 public_id: "",
//                 secure_url: ""
//             }
//         })

//         user.role = "Admin"
//         await user.save()
//         console.log('created admin', user)

//         // Upload the avatar Image
//         console.log(req.file)
//         if (req.file) {
//             try {
//                 const result = await cloudinary.v2.uploader.upload(req.file.path, {
//                     folder: "avatars",
//                     width: 150,
//                     height: 150,
//                     crop: "fill",
//                     gravity: "faces",
//                 })
//                 if (result) {
//                     user.avatar.public_id = result.public_id
//                     user.avatar.secure_url = result.secure_url

//                     // remove the file from the local server 
//                     fs.rm(`uploads/${req.file.filename}`)
//                 }
//             } catch (error) {
//                 return next(new Apperror("Image upload failed" || error, 500))
//             }
//         }

//         await user.save()
//         const token = await user.generateJwttoken();
//         user.password = undefined
//         res.cookie('token', token, cookieOption)
//         console.log('user save', user)
//         res.status(200).json({
//             success: true,
//             msg: "User registered successfully",
//             user
//         })
//     }
//     catch (error) {
//         res.status(400).json({
//             success: false,
//             msg: "User registration failed"
//         })
//     }
// }

const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return next(new Apperror("All fields are required", 400))
        }
        const user = await User.findOne({ email }).select("+password")
        if (!user || !user.comparedPassword(password)) {
            return next(new Apperror("Email or password does not match", 400))
        }
        // const isMatch = await bcrypt.compare(password, user.password);

        const token = await user.generateJwttoken();
        user.password = undefined
        res.cookie('token', token, cookieOption)
        user.save()
        res.status(200).json({
            success: true,
            msg: "User logged in successfully",
            user
        })
    } catch (error) {
        return next(new Apperror(error, 400))
    }
}
const logout = (req, res, next) => {
    res.clearCookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        msg: "User Logged out successfully"
    })
}
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            msg: "user details",
            user,
        })
    } catch (error) {
        return next(new Apperror("Failed to fetch the information", 400))
    }
}


const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    console.log(email)
    if (!email) {
        return next(new Apperror("Email is required", 400))
    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new Apperror("Email not register", 400))
    }

    const resetToken = await user.generateResetPasswordToken();
    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = "Password reset"
    const message = `Click on the link to reset your password : ${resetPasswordUrl}`
    try {
        console.log(resetPasswordUrl)
        await sendEmail(email, subject, message)
        res.status(200).json({
            success: true,
            msg: `Reset password token has been send on the register Email :${email}`,
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save()
        return next(new Apperror(error, 500))
    }
}

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({
        forgotPassword,
        forgotPasswordExpiry: { $gt: Date.now() }
    });
    if (!user) {
        return next(new Apperror("Token is invalid  or expired !! please try agaiin.", 400))
    }
    user.password = password
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined

    await user.save()

    res.status(201).json({
        succcess: true,
        msg: "Password changed sucessfully",
        user
    })
}

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const { id } = req.user;
    console.log(id)
    console.log('oldPassword', oldPassword,
        'newPassword', newPassword)

    if (!oldPassword || !newPassword) {
        return next(new Apperror("All fileed are required", 400));
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
        return next(new Apperror("User does not exist", 400));

    }
    console.log(
        user
    )
    const isPasswordValid = await user.comparedPassword(oldPassword);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
        return next(new Apperror("invalid Old password", 400));
    }

    user.password = newPassword

    console.log(user.password)
    user.password = undefined

    res.status(200).json({
        succcess: true,
        msg: "Password change successfully"
    })
}


const updateUser = async (req, res, next) => {
    try {
        const { fullname } = req.body;
        const { id } = req.params
        const userid = id.toString()
        const user = await User.findById(userid);
        if (!user) {
            return next(new Apperror("User does not exist", 400));
        }
        if (req.fullname) {
            user.fullname = fullname
        }
        if (req.file) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "avatars",
                    width: 150,
                    height: 150,
                    crop: "fill",
                    gravity: "faces",
                })
                if (result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url = result.secure_url

                    // remove the file from the local server 
                    fs.rm(`uploads/${req.file.filename}`)
                }
                await user.save();
            } catch (error) {
                return next(new Apperror("Image upload failed", 500))
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            msg: "Update Profile successfully"
        })
    } catch (error) {
        return next(new Apperror(error))
    }
}
export {
    registerUser,
    loginUser,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}