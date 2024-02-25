// import the packages  
import cloudnary from 'cloudinary'

import fs from 'fs/promises'

// import the files
import Cource from '../models/courceModel.js'
import Apperror from '../utils/erorUtils.js'
const getAllCources = async (req, res, next) => {
    try {
        const cources = await Cource.find({}).select('-lectures')

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
            lectures: Cource.lectures,
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
    try {
        console.log(title,description)
        if (!title || !description) {
            return next(new Apperror("Please provide title and description", 400))
        }
        const cource = await Cource.findById(id);

        if (!cource) {
            return next(new Apperror("Cource with given id does not exist", 404))
        }

        const lectureData = {
            title,
            description,
            lecture: {}
        }

        if (req.file) {
            const result = await cloudnary.v2.uploader.upload(req.file.path, {
                folder: "lecture",
                resource_type : 'video'
            })
            if (result) {
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }

            //remvove the file from local server
            fs.rm(`uploads/${req.file.filename}`)
        }

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
export {
    getAllCources,
    getLectureByCourceId,
    createCource,
    updateCource,
    removeCource,
    addLectureToCourceById
}