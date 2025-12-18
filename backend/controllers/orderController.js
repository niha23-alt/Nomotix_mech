import Order from "../models/Order.js";
import PaymentService from "../services/paymentService.js";
import AuditLog from "../models/AuditLog.js";
export const getOrderbyCustomer =async (req,res)=>{
    try{
        const orders= await Order.find({Customer:req.params.customerId}).populate("garage","name location").sort({createdAt:-1});
    res.status(200).json(orders);
    }catch(err){
        res.status(500).json({message:err.message});
    }
};
export const getOrderbyGarage =async(req,res)=>{
    try{
        const orders=await Order.find({garage:req.params.garageId});
        res.status(200).json({orders});
    }catch(err){
        res.status(500).json({message:err.message});
    }
};
export const createOrder = async (req,res) =>{
    try{
        const order= await new Order(req.body);
        const savedOrder = await order.save();
        res.status(200).json(order);
    }catch(err){
        console.log(err);
        res.status(500).json({message:err.message});
    }
};
export const reassignOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newGarageId } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { garage: newGarageId },
      { new: true }
    ).populate("garage", "name location");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus,
        paymentMethod,
        'paymentDetails.transactionId': transactionId,
        'paymentDetails.amount': req.body.amount
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel Order (Delete from database)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      cancellationReason,
      cancelledBy,
      cancellationType = 'customer'
    } = req.body;

    // Find the order
    const order = await Order.findById(orderId)
      .populate('Customer', 'name email')
      .populate('garage', 'name location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed order"
      });
    }

    if (order.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that is in progress"
      });
    }

    // Calculate cancellation policy
    const cancellationPolicy = getCancellationPolicy(order);
    const cancellationFee = calculateCancellationFee(order);
    const refundAmount = calculateRefundAmount(order, cancellationFee);

    // Store cancellation details for response
    const cancellationDetails = {
      orderId: order._id,
      orderNumber: order._id.toString().slice(-8),
      cancelledAt: new Date(),
      cancelledBy: cancelledBy,
      cancellationReason: cancellationReason,
      cancellationType: cancellationType,
      cancellationFee: cancellationFee,
      refundAmount: refundAmount,
      cancellationPolicy: cancellationPolicy,
      originalAmount: order.bill?.total || 0,
      customerName: order.Customer?.name,
      garageName: order.garage?.name,
      serviceType: order.serviceType
    };

    // Process refund if payment was made
    let refundStatus = 'not_applicable';
    if (order.paymentStatus === 'paid' && refundAmount > 0) {
      try {
        const refundResult = await PaymentService.processRefund(orderId, {
          amount: refundAmount,
          reason: `Order cancellation: ${cancellationReason}`
        });

        refundStatus = refundResult.success ? 'processed' : 'failed';
        cancellationDetails.refundStatus = refundStatus;
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        refundStatus = 'failed';
        cancellationDetails.refundStatus = refundStatus;
      }
    }

    // Log cancellation in audit log before deletion
    await AuditLog.logAction({
      action: 'order_cancelled',
      entityType: 'order',
      entityId: orderId,
      performedBy: cancelledBy,
      performedByType: cancellationType,
      details: {
        orderId: orderId,
        orderNumber: order._id.toString().slice(-8),
        customerName: order.Customer?.name,
        customerId: order.Customer?._id,
        garageName: order.garage?.name,
        garageId: order.garage?._id,
        serviceType: order.serviceType,
        originalAmount: order.bill?.total || 0,
        cancellationReason: cancellationReason,
        cancellationFee: cancellationFee,
        refundAmount: refundAmount,
        refundStatus: refundStatus,
        cancellationPolicy: cancellationPolicy
      },
      metadata: {
        reason: cancellationReason,
        previousState: {
          status: order.status,
          paymentStatus: order.paymentStatus
        },
        newState: {
          status: 'deleted',
          deletedAt: new Date()
        }
      }
    });

    // Delete the order from database
    await Order.findByIdAndDelete(orderId);

    // Log cancellation for console (backup logging)
    console.log('Order cancelled and deleted:', {
      orderId: orderId,
      customerName: order.Customer?.name,
      garageName: order.garage?.name,
      cancellationReason: cancellationReason,
      refundAmount: refundAmount,
      cancellationFee: cancellationFee,
      deletedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled and removed successfully",
      cancellationDetails: cancellationDetails
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if order can be cancelled
export const canCancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerId } = req.query;

    const order = await Order.findOne({
      _id: orderId,
      Customer: customerId
    });

    if (!order) {
      return res.json({
        canCancel: false,
        reason: "Order not found or unauthorized"
      });
    }

    if (order.status === 'cancelled') {
      return res.json({
        canCancel: false,
        reason: "Order is already cancelled"
      });
    }

    if (order.status === 'completed') {
      return res.json({
        canCancel: false,
        reason: "Cannot cancel completed order"
      });
    }

    // Check time-based cancellation policy
    const timeSinceCreation = Date.now() - new Date(order.createdAt).getTime();
    const hoursElapsed = timeSinceCreation / (1000 * 60 * 60);

    let canCancel = true;
    let cancellationPolicy = '';
    let cancellationFee = 0;

    if (order.status === 'pending') {
      if (hoursElapsed < 1) {
        cancellationPolicy = 'Free cancellation within 1 hour';
        cancellationFee = 0;
      } else if (hoursElapsed < 24) {
        cancellationPolicy = 'Cancellation fee applies after 1 hour';
        cancellationFee = 50;
      } else {
        cancellationPolicy = 'Cancellation fee applies after 24 hours';
        cancellationFee = 100;
      }
    } else if (order.status === 'accepted') {
      if (hoursElapsed < 2) {
        cancellationPolicy = 'Cancellation fee applies for accepted orders';
        cancellationFee = 100;
      } else {
        cancellationPolicy = 'Higher cancellation fee for late cancellation';
        cancellationFee = 200;
      }
    } else if (order.status === 'in-progress') {
      cancellationPolicy = 'Cannot cancel order in progress';
      canCancel = false;
    }

    const refundAmount = calculateRefundAmount(order, cancellationFee);

    res.json({
      canCancel,
      reason: canCancel ? null : cancellationPolicy,
      cancellationPolicy,
      cancellationFee,
      refundAmount,
      orderStatus: order.status,
      hoursElapsed: Math.round(hoursElapsed * 10) / 10
    });

  } catch (error) {
    console.error('Can cancel order error:', error);
    res.status(500).json({
      canCancel: false,
      reason: "Server error"
    });
  }
};

// Helper functions
function getCancellationPolicy(order) {
  const timeSinceCreation = Date.now() - new Date(order.createdAt).getTime();
  const hoursElapsed = timeSinceCreation / (1000 * 60 * 60);

  if (order.status === 'pending') {
    if (hoursElapsed < 1) return 'Free cancellation within 1 hour';
    if (hoursElapsed < 24) return 'Cancellation fee applies after 1 hour';
    return 'Cancellation fee applies after 24 hours';
  } else if (order.status === 'accepted') {
    return 'Cancellation fee applies for accepted orders';
  } else if (order.status === 'in-progress') {
    return 'Service in progress - cancellation not allowed';
  }
  return 'Standard cancellation policy';
}

function calculateCancellationFee(order) {
  const timeSinceCreation = Date.now() - new Date(order.createdAt).getTime();
  const hoursElapsed = timeSinceCreation / (1000 * 60 * 60);

  if (order.status === 'pending') {
    if (hoursElapsed < 1) return 0;
    if (hoursElapsed < 24) return 50;
    return 100;
  } else if (order.status === 'accepted') {
    if (hoursElapsed < 2) return 100;
    return 200;
  }
  return 0;
}

function calculateRefundAmount(order, cancellationFee) {
  if (order.paymentStatus !== 'paid') return 0;

  const totalPaid = order.paymentDetails?.amount || order.bill?.total || 0;
  const refundAmount = Math.max(0, totalPaid - cancellationFee);

  return refundAmount;
}