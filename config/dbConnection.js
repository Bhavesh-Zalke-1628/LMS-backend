
import mongoose from "mongoose"
const URI = "mongodb://127.0.0.1:27017/lms"
mongoose.set('strictQuery', false)
const connectToDb = async () => {
    try {
        const { connection } = await mongoose.connect(URI)
        if (connection) {
            console.log(`Connected successfully with the databse :${connection.host}`)
        }  
    } catch (error) {
        console.log("database connection failed")
        process.exit(1);
    }
}


export default connectToDb;