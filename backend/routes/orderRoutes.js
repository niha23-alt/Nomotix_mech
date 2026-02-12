import express from "express";

import {getOrderbyCustomer,getOrderbyGarage,createOrder,reassignOrder,updatePaymentStatus,cancelOrder,canCancelOrder,updateOrderStatus} from "../controllers/orderController.js";
=======
import {
  getOrderbyCustomer,
  getOrderbyGarage,
  createOrder,
  reassignOrder,
  updatePaymentStatus,
  cancelOrder,
  canCancelOrder,
  getNearbyOrders,
  acceptOrder
} from "../controllers/orderController.js";


const router = express.Router();


router.post("/",createOrder);
router.get("/customer/:customerId",getOrderbyCustomer);
router.get("/garage/:garageId",getOrderbyGarage);
router.get("/nearby/:garageId", getNearbyOrders);
router.put("/accept/:orderId", acceptOrder);
router.put("/reassign/:orderId", reassignOrder);
router.put("/payment/:orderId", updatePaymentStatus);
router.put("/status/:orderId", updateOrderStatus);

// Cancellation routes
router.put("/cancel/:orderId", cancelOrder);
router.get("/can-cancel/:orderId", canCancelOrder);

export default router;
