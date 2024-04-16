import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userSchema = new Schema({
    fullname: {
        type: String,
        required: [true, 'Name is required'],
        maxLenght: [5, "Name must be atleast 5 character"],
        maxLenght: [20, "Name should be less than 5 character"],
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
        maxLenght: [8, "Name must be atleast 8 character"],
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: "User"
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    }
},
    {
        timestamps: true
    }
)

// ecnrypt the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
}
)

// JWT Token
userSchema.methods.generateJwttoken = async function () {
    return await jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
            subscription: this.subscription
        },
        process.env.SECRET,
        {
            expiresIn: '10d'
        }
    )
}


// compare the enc password with the entered password
userSchema.methods.comparedPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.generateResetPasswordToken = async function () {
    const resetToken = await crypto.randomBytes(20).toString('hex')
    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        ;
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000 //15min from now 

    return resetToken;
}
const User = new model("User", userSchema)
export default User;