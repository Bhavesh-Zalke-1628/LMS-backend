import { Schema, model } from 'mongoose'
const courceSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minLength: [8, "Title must be at least 8 characters"],
        maxLength: [60, "Title must be at less 60 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minLength: [8, "Title must be at least 8 characters"],
        maxLength: [200, "Title must be less than 200 characters"],
        trim: true
    },
    categeory: {
        type: String,
        required: [true, "Categeory is required"],
    },
    thumbnails: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            },
            comments: [
                {
                    studentName: String,
                    comment: String,
                    date: String,
                    photo: String
                },
            ]
        }
    ],
    numberOfLecture: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    },
);

const Cource = model('Cource', courceSchema)

export default Cource;