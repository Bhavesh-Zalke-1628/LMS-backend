import { config } from 'dotenv'
config();

import cloudnary from 'cloudinary'
import app from './app.js'
import connectToDb from './config/dbConnection.js'
import Razorpay from 'razorpay'

const PORT = process.env.PORT || 3000

cloudnary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

export const razorpay = new Razorpay({
    key_id: process.env.RazorpayKeyId,
    key_secret: process.env.key_secret
})

app.listen(PORT, async () => {
    await connectToDb()
    console.log(`The port is runnig at http://localhost:${PORT}`)
})  