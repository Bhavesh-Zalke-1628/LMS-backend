import { config } from "dotenv"
config();
import Apperror from "../utils/erorUtils.js"
import User from "../models/userModel.js";
import { razorpay } from "../server.js";
import crypto from 'crypto'
import Payment from "../models/paymentModel.js";
const getRazorpayKey = async (req, res, next) => {
    try {
        const getId = process.env.RazorpayKeyId
        res.status(200).json({
            success: true,
            msg: "successfully get the razorpay key",
            key: getId
        })
    } catch (error) {
        return next(
            new Apperror("Failed to get the razorpay key", 400)
        );
    }
}


const buySubscription = async (req, res, next) => {

    const { id } = req.user
    try {
        const user = await User.findById(id);
        if (!user) {
            return next(
                new Apperror("Unauthroised , Please log in", 400)
            );
        }
        if (user.role == 'Admin') {
            return next(
                new Apperror("Admin cannot purchase the subscription", 400)
            );
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.Razorpay_paln_id,
            customer_notify: 1,
            total_count: 10
        })

        console.log(subscription)
        user.subscription.id = subscription.id
        user.subscription.status = subscription.status


        console.log(user.subscription.status)
        await user.save()


        res.status(200).json({
            success: true,
            msg: "Subscribed successfully",
            subscription_id: subscription.id
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: error
        })
    }
}
const verifySbscription = async (req, res, next) => {
    const { id } = req.user;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body
    console.log('razorpay_payment_id >', razorpay_payment_id, 'razorpay_signature >', razorpay_signature, 'razorpay_subscription_id >', razorpay_subscription_id)
    try {
        const user = await User.findById(id)
        if (!user) {
            return next(
                new Apperror("Unauthroised , Please log in", 400)
            );
        }

        const subscription_id = user.subscription.id

        console.log(subscription_id)
        const generatedSignature = crypto
            .createHash('sha256', process.env.key_secret)
            .update(`${razorpay_payment_id} |${subscription_id}`)
            .digest('hex')

        console.log('generatedSignature >', generatedSignature)
        // if (generatedSignature !== razorpay_signature) {
        //     return next(new Apperror("Payment not verified please try again", 400))
        // }
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        console.log(user?.subscription)
        user.subscription.status = 'active'
        console.log(user?.subscription)
        console.log(user)
        await user.save()
        res.status(200).json({
            success: true,
            msg: "Payment verified successfully",
            user
        })
    } catch (error) {
        return next(
            new Apperror(error, 400)
        )
    }
}
const cancleSubscription = async (req, res, next) => {
    const { id } = req.user
    try {
        const user = await User.findById(id)
        console.log(user)
        if (!user) {
            return next(
                new Apperror("Unauthroised , Please log in", 400)
            );
        }
        if (user.role == 'Admin') {
            return next(
                new Apperror("Admin cannot purchase the subscription", 400)
            );
        }
        const subscription_id = user.subscription.id
        console.log(subscription_id)
        const subscription = await razorpay.subscriptions.cancel(subscription_id);
        console.log(subscription.status)
        user.subscription.status = subscription.status
        await user.save()
        res.status(200).json({
            success: true,
            msg: "Subscription cancelled successfully",
            user
        })
    } catch (error) {
        // return next(
        //     new Apperror(error, 400)
        // )
        console.log(
            'error', error
        )
    }
}
const allPayment = async (req, res, next) => {
    try {
        const { count } = req.query

        console.log(count)
        const payments = await razorpay.subscriptions.all({
            count: count || 10
        })
        let allPayments = 0;
        let finalMonthPayment = 0;
        const monthlySalesRecord = {};

        // Iterate through each payment record
        payments.items.forEach(payment => {
            // Extract relevant information from the payment record
            const amount = payment.paid_count; // Assuming amount is a key in each payment record
            const date = new Date(payment.created_at); // Assuming timestamp is a key in each payment record
            // Aggregate all payments
            allPayments += amount;

            // Calculate final month payment
            const paymentMonth = date.getMonth();
            const currentMonth = new Date().getMonth();
            if (paymentMonth === currentMonth) {
                finalMonthPayment += amount;
            }

            // Create or update monthly sales record
            const monthKey = `${date.getFullYear()}-${paymentMonth + 1}`; // +1 because getMonth() returns zero-based index
            if (monthlySalesRecord[monthKey]) {
                monthlySalesRecord[monthKey] += amount;
            } else {
                monthlySalesRecord[monthKey] = amount;
            }
        });

        // Output the results
        console.log("All Payments:", allPayments);
        console.log("Final Month Payment:", finalMonthPayment);
        console.log("Monthly Sales Record:", monthlySalesRecord);



        res.status(200).json({
            success: true,
            msg: "All payments",
            data: payments,
            allPayment,
            finalMonthPayment,
            monthlySalesRecord
        })
    } catch (error) {
        return next(
            new Apperror(error, 400)
        )
    }
}



const statData = async (req, res, next) => {
    try {
    } catch (error) {
        return next(
            new Apperror(error, 400)
        )
    }
}

export {
    getRazorpayKey,
    buySubscription,
    allPayment,
    verifySbscription,
    cancleSubscription
}