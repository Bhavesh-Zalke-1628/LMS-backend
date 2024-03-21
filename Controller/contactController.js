import Contact from "../models/contactModel.js"
import Apperror from "../utils/erorUtils.js"

const addContact = async (req, res, next) => {
    const { name, email, message } = req.body
    try {
        console.log(name, email, message)
        const contact = await Contact.create({
            name, email, message
        })
        res.status(200).json({
            success: true,
            msg: "successful",
            contact
        })
    } catch (error) {
        next(
            new Apperror(error, 400)
        )
    }
}


export {
    addContact,
}