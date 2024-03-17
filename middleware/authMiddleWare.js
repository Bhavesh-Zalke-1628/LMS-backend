import User from "../models/userModel.js";
import Apperror from "../utils/erorUtils.js";
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new Apperror("unauthenticated ,Please log in again", 400))
    }
    const userDetails = await jwt.verify(token, process.env.SECRET)
    req.user = userDetails

    next()
}

const authorisedRoles = (...roles) => async (req, res, next) => {
    console.log(req.user)
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
        return next(
            new Apperror("You do not have permission to you access this route", 400)
        )
    }
}


const authorisedSubscriber = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    console.log('authorisedSubscriber user >', user)
    // console.log(user.subscription.id)
    if (user.role !== 'Admin' && user.subscription.status !== 'active') {
        return next(
            new Apperror('Plase subscribe to access this cource ', 400)
        );
    }
    next();
}
export { isLoggedIn, authorisedRoles, authorisedSubscriber }
