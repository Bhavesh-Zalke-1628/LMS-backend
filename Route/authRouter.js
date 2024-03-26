// import the packages
import { Router } from "express";
const router = Router()

// import the files 
import { logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser, loginUser, registerUser } from '../Controller/authController.js'
import upload from '../middleware/multerMiddle.js'
import { isLoggedIn } from "../middleware/authMiddleWare.js";

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login/user').post(loginUser);
router.route('/logout').get(logout);
router.route('/me').get(isLoggedIn, getProfile);
router.post('/reset', forgotPassword);
router.post('/reset:resetToken', resetPassword);
router.route('/change-password').post(isLoggedIn, changePassword)
router.put('/update/:id', isLoggedIn, upload.single('avatar'), updateUser)

export default router;
