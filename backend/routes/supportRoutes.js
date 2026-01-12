import express from "express";
import { getSupportContacts, addSupportContact } from "../controllers/supportController.js";

const router = express.Router();

// Public route to get support contacts
router.get("/", getSupportContacts);

// Protected route to add support contact (can be secured with auth middleware later)
router.post("/", addSupportContact);

export default router;