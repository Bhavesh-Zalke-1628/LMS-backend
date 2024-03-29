// import the router
import { Router } from "express";
const router = Router();


// import the controller
import { getAllCources, getLectureByCourceId, createCource, updateCource, removeCource, addLectureToCourceById, addComment, deleteLecture } from '../Controller/courceController.js'
import upload from '../middleware/multerMiddle.js'
import { authorisedRoles, isLoggedIn } from "../middleware/authMiddleWare.js";


router.route('/')
    .get(getAllCources)
    .post(
        // isLoggedIn,
        upload.single('thumbnails'),
        createCource
    )
router.route('/:id')
    .get(
        isLoggedIn,
        getLectureByCourceId
    )
    .put(
        isLoggedIn,
        authorisedRoles('Admin'),
        updateCource
    )
    .delete(
        isLoggedIn,
        // authorisedRoles('Admin'),
        removeCource
    )
    .post(
        isLoggedIn,
        // authorisedRoles('Admin'),
        upload.single('lecture'),
        addLectureToCourceById,
    )

router.route('/')
    .delete(
        isLoggedIn,
        // authorisedRoles('Admin'),
        deleteLecture
    )



// commnet area 
router.route('/:id/comment/:lectureId')
    .post(
        // isLoggedIn,
        addComment
    )


export default router;


// prafulBhau
// 7888074279