import express from "express";
import {getOrderbyCustomer,getOrderbyGarage,createOrder,reassignOrder,updatePaymentStatus,cancelOrder,canCancelOrder} from "../controllers/orderController.js";

const router = express.Router();


router.post("/",createOrder);
router.get("/customer/:customerId",getOrderbyCustomer);
router.get("/garage/:garageId",getOrderbyGarage);
router.put("/reassign/:orderId", reassignOrder);
router.put("/payment/:orderId", updatePaymentStatus);

// Cancellation routes
router.put("/cancel/:orderId", cancelOrder);
router.get("/can-cancel/:orderId", canCancelOrder);

export default router;
