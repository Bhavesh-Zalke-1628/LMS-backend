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
    console.log(title, description, description, categeory)
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
        console.log(req.file)
        if (req.file) {
            const result = await cloudnary.v2.uploader.upload(req.file.path, {
                folder: "Cources",

            });
            console.log(result)
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
            return next(new Apperror("Cource with given id does not exist", 404))
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
    console.log('helo')
    const { title, description } = req.body;
    const { id } = req.params;
    console.log(title, description)
    console.log(id)
    try {
        if (!title || !description) {
            return next(new Apperror("Please provide title and description", 400))
        }
        const cource = await Cource.findById(id);

        if (!cource) {
            return next(new Apperror("Cource with given id does not exist", 404))
        }

        console.log('hello')
        const lectureData = {
            title,
            description,
            lecture: {
                public_id: "public id",
                secure_url: "https://res.cloudinary.com/dnjforhdj/video/upload/v1710049711/avatars/crvjvwdjkcddlcp2iecj.mp4"
            }
        }

        async function uploadLecture(filePath) {
            console.log('filePath', filePath)
            if (filePath) {
                console.log(filePath)
                try {
                    const result = await cloudnary.v2.uploader.upload(filePath.path, {
                        folder: "lectures",
                        resource_type: 'video',
                        allowed_formats: ['mp4', 'auto']
                    })
                    if (result) {
                        lectureData.lecture.public_id = result.public_id
                        lectureData.lecture.secure_url = "https://res.cloudinary.com/dnjforhdj/video/upload/v1710049711/avatars/crvjvwdjkcddlcp2iecj.mp4"
                    }

                } catch (error) {
                    return next(new Apperror("Image upload failed" || error, 500))
                }
            }

        }
        console.log(req.file)
        uploadLecture(req.file)

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

const deleteLecture = async (req, res, next) => {
    const { courseId, lectureId } = req.query
    try {
        console.log(courseId, lectureId)
        const cource = await Cource.findById(courseId)

        if (!cource) {
            return next(
                new Apperror("Cource not found", 400)
            )
        }

        const x = cource.lectures.filter((ele) => {
            return ele._id == lectureId
        })

        console.log(x[0])
        x[0].deleteOne()
        cource.save()
        res.status(200).json({
            success: true,
            msg: "Delete lecture successfuly",
            cource
        })
    } catch (error) {
        console.log(error)
    }
}

const addComment = async (req, res, next) => {
    const bodyData = req.body
    const { id, lectureId } = req.params;
    try {
        // console.log(comment)
        console.log(id, lectureId)
        const date = new Date

        const divs = date.getDate()
        const mahina = date.getMonth() + 1
        const varsh = date.getFullYear()
        const time = `${divs}/${mahina}/${varsh}`
        const cource = await Cource.findById(id);
        if (!cource) {
            return next(new Apperror("Cource not found", 404))
        }

        const lecture = cource?.lectures;
        const data = lecture.filter(ele => {
            return ele._id == lectureId
        })


        const x = {
            studentName: bodyData[1],
            comment: bodyData[0],
            date: time,
            photo: bodyData[2]
        }
        const commentData = Cource
        console.log(commentData)
        data[0].comments.push(x)
        cource.save()
        res.status(200).json({
            success: true,
            msg: "Comment add successfully",
            data: commentData
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const deleteComment = async (req, res, next) => {
    try {
        res.status(400).json({
            success: true,
            msg: "Commen delete successfully",
        })
    } catch (error) {
        next(
            new Apperror(error, 400)
        )
    }
}
export {
    getAllCources,
    getLectureByCourceId,
    createCource,
    updateCource,
    removeCource,
    addLectureToCourceById,
    deleteLecture,
    addComment,
    deleteComment
}