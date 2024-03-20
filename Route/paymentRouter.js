import { Router } from "express";
import { allPayment, buySubscription, getRazorpayKey, cancleSubscription, verifySbscription } from "../Controller/paymentController.js";
import { authorisedRoles, authorisedSubscriber, isLoggedIn } from "../middleware/authMiddleWare.js";

const router = Router()

router
    .route('/razorpay-key/getid')
    .get(

        getRazorpayKey
    )
router
    .route('/razorpay/subscribe')
    .post(
        isLoggedIn,
        buySubscription
    )

router
    .route('/razorpay/verify')
    .post(
        isLoggedIn,
        verifySbscription
    )
router
    .route('/unsubscribe')
    .post(
        isLoggedIn,
        authorisedSubscriber,
        cancleSubscription
    )

router
    .route('/')
    .get(
        // isLoggedIn,
        // authorisedRoles('Admin'),
        // authorisedSubscriber,
        allPayment
    )


export default router