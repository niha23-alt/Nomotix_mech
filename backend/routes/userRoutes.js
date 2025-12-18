import { addCar,updateCar,deleteCar,getUserCars,getUserProfile,updateUserProfile } from "../controllers/userController.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.post("/car", verifyToken, addCar);
router.put("/car/:carId", verifyToken, updateCar);
router.delete("/car/:carId", verifyToken, deleteCar);
router.get("/cars", verifyToken, getUserCars);   
export default router;