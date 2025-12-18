import express from "express";
import {getallServices,createService} from "../controllers/serviceController.js";

const router =express.Router();

router.post("/",createService);
router.get("/",getallServices);
export default router;