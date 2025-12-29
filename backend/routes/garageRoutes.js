import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {getGaragesinLocation,createGarage,getGaragesinBounds,getGarageById, updateGarage, getGarageSlots, getGarageByPhone} from "../controllers/garageController.js";

const router=express.Router();

// Configure multer for garage document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/garages/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

const garageUpload = upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'garageLicense', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]);

router.post("/", garageUpload, createGarage);
router.put("/:id", updateGarage);
router.get("/in-bounds",getGaragesinBounds);
router.get("/nearbygarages",getGaragesinLocation);
router.get("/phone/:phone", getGarageByPhone);
router.get("/:id/slots",getGarageSlots);
router.get("/:id",getGarageById);

export default router;