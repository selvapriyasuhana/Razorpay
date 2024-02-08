//const router = require("express").Router();
const express = require("express");
const router = express.Router();
const Order= require("../Model/paymentmodel.js");
module.exports = function (razorpayInstance) {
//const razorpay = require('../index.js');
//const { razorpay } = require('../index.js');
//require('dotenv').config();
router.post('/create-order', async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt_order_74394',
      payment_capture: 1
    };
    console.log('Options:', options);


try {
  const response = await razorpayInstance.orders.create(options); 
   // Create order in database
    const order = new Order({
      amount: amount
    });
    await order.save();
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create order');
  }
});
  
//   router.post('/capture-payment', async (req, res) => {
//     const { payment_id, amount } = req.body;
  
//     try {
//       const response = await razorpay.payments.capture(payment_id, amount * 100);
//       // Update order status in database
//       await Order.updateOne({ receipt: 'receipt_order_74394' }, { status: 'paid' });
//       res.json(response);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Failed to capture payment');
//     }
//   });
router.post('/capture-payment', async (req, res) => {
    const { payment_id, amount } = req.body;

    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Capture the payment
        const response = await razorpayInstance.payments.capture(payment_id, amount * 100);

        // Update order status in database
        const updatedOrder = await Order.findOneAndUpdate({ receipt: 'receipt_order_74394' }, { status: 'paid' });

        // Create a new payment record in the database
        const payment = new Payment({
            orderId: updatedOrder._id, // Assuming you have an orderId field in your Payment model
            paymentId: payment_id,
            amount: amount,
            captureDate: new Date()
        });
        await payment.save();

        res.json({ success: true, message: 'Payment captured successfully', payment: payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to capture payment' });
    }
});


  return router;
};
