// import the packages  
import cloudnary from 'cloudinary'

import fs from 'fs/promises'

// import the files
import Cource from '../models/courceModel.js'
import Apperror from '../utils/erorUtils.js'
import User from '../models/userModel.js'
const getAllCources = async (req, res, next) => {
    try {
        const cources = await Cource.find({})

        res.status(200).json({
            success: true,
            msg: "All courcess",
            cources
        });
    } catch (error) {
        next(new Apperror(error.message, 500))
    }
}

const getLectureByCourceId = async (req, res, next) => {
    try {

        const { id } = req.params;
        const cource = await Cource.findById(id);
        console.log(id)

        if (!cource) {
            return next(new Apperror("Cource not found", 404))
        }
        res.status(200).json({
            success: true,
            msg: "Cources fetched successfully",
            lectures: cource.lectures,
            cource
        });
    } catch (error) {

    }
}

const createCource = async (req, res, next) => {
    const { title, description, categeory, createdBy } = req.body;

    try {
        if (!title || !description || !categeory || !createdBy) {
            return next(new Apperror("All fields are required", 400))
        }
        const cource = await Cource.create({
            title,
            description,
            categeory,
            createdBy,
            thumbnails: {
                public_id: "sample id",
                secure_url: "sample url"
            }
        })
        if (!cource) {
            return next(
                new Apperror("Cource Couldn't be created", 401)
            )
        }
        if (req.file) {
            const result = await cloudnary.v2.uploader.upload(req.file.path, {
                folder: "Cources",
            });
            if (result) {
                cource.thumbnails.public_id = result.public_id;
                cource.thumbnails.secure_url = result.secure_url;
            }
            //remvove the file from local server
            fs.rm(`uploads/${req.file.filename}`)
        }
        await cource.save();
        res.status(200).json({
            success: true,
            msg: " Cource created successfully",
            cource,
        })
    } catch (error) {
        console.log(error)
        return next(new Apperror(error, 500))
    }
}

const updateCource = async (req, res, next) => {
    const { id } = req.params;
    try {
        const cource = await Cource.findOneAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                runValidators: true,
            }
        )
        if (!cource) {
            return next(new Aprror("Cource with given id does not exist", 404))
        }

        res.status(200).json({
            success: true,
            msg: "Cource updated sucessfully",
            cource
        })
    } catch (error) {
        return next(new Apperror(error, 500))
    }

}

const removeCource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cource = await Cource.findById(id);
        if (!cource) {
            return next(new Apperror("Cource with given id does not exist", 404))
        }

        await cource.deleteOne();
        res.status(200).json({
            success: true,
            msg: "Cource  deleted sucessfully",
        })
    } catch (error) {
        return next(new Apperror(error, 500))
    }
}

const addLectureToCourceById = async (req, res, next) => {
    const { title, description } = req.body;
    const { id } = req.params;
    console.log(title, description)
    console.log(id)
    try {
        if (!title || !description) {
            return next(new Apperror("Please provide title and description", 400))
        }
        const cource = await Cource.findById(id);

        console.log(cource)
        if (!cource) {
            return next(new Apperror("Cource with given id does not exist", 404))
        }

        const lectureData = {
            title,
            description,
            lecture: {
                public_id: "public id",
                secure_url: "sample id"
            }
        }

        // if (req.file) {
        console.log(req.file)
        // try {
        const result = await cloudnary.v2.uploader.upload(req.file, {
            folder: "Lecture data",
            resource_type: 'video',
            chunk_size: "600000"
        })
        console.log(result)
        if (result) {
            lectureData.lecture.public_id = result.public_id
            lectureData.lecture.secure_url = result.secure_url
            // remove the file from the local server 
            fs.rm(`uploads/${req.file.filename}`)
        }
        // } catch (error) {
        //     return next(new Apperror("Image upload failed" || error, 500))
        // }
        // }

        //added lecture it is 
        cource.lectures.push(lectureData);

        // add the number of lectures
        cource.numberOfLecture = cource.lectures.length;
        await cource.save();

        res.status(200).json({
            success: true,
            msg: "Lecture added successfully",
            lectureData
        })
    } catch (error) {
        return next(new Apperror(error, 500))
    }
}


const addComment = async (req, res, next) => {
    // console.log('hello')
    const { comment } = req.body
    const name = req.user.name
    try {

        console.log(name)
        const { id, lectureId } = req.params;
        const cource = await Cource.findById(id);

        // const student = await User.findById(userId)

        // console.log('student', student)

        if (!cource) {
            return next(new Apperror("Cource not found", 404))
        }

        const lecture = cource?.lectures;


        const data = lecture.filter(ele => {
            return ele._id == lectureId
        })
        console.log(name)
        const date = new Date()
        const x = {
            studentName: name,
            comment: comment,
        }
        data[0].comments.push(x)
        cource.save()
        res.status(200).json({
            success: true,
            msg: "Comment add successfully",
            cource
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}
export {
    getAllCources,
    getLectureByCourceId,
    createCource,
    updateCource,
    removeCource,
    addLectureToCourceById,
    addComment
}