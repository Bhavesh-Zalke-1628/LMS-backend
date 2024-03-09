// make a multer middle ware for the file upload 
import path from 'path';
import multer from 'multer';
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 50 * 1024 * 1024 }, // 50mb in size of the file
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    }),
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".png" &&
            ext !== '.mp4' 
        ) {
            cb("unsuppoerted file", false);
            return;
        }
        cb(null, true);
    }
})


export default upload;