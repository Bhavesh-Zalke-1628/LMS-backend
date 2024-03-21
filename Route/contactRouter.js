import { Router } from "express";
import { addContact } from "../Controller/contactController.js";

const router = Router()

router.route('/')
    .post(addContact)

export default router