import { config } from 'dotenv'
config();

import cloudnary from 'cloudinary'
import app from './app.js'
import connectToDb from './config/dbConnection.js'
import Razorpay from 'razorpay'
import { Server, Socket } from 'socket.io'
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

const io = new Server(8000)

io.on("Connection", (socket) => {
    console.log(`Socket connected`, socket.id)
})

app.listen(PORT, async () => {
    await connectToDb()
    console.log(`The port is runnig at http://localhost:${PORT}`)
})  