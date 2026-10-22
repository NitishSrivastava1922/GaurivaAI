import { PLANS } from "../config/plans.js";
import crypto from "crypto";
import axios from "axios";
import Payment from "../models/payment.model.js";
import razorpay from "../config/razorpay.js";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];
    const selectedPlan = PLANS[plan];

    if (!userId) {
      return res.status(401).json({ message: "User ID header is missing" });
    }

    if (!selectedPlan) {
      return res.status(404).json({ message: "plan not found" });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    });

    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    return res.status(201).json({ order, plan: selectedPlan });
  } catch (error) {
    console.error("Billing order creation failed:", error.message);
    return res.status(500).json({ message: "Unable to create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.headers["x-user-id"];

    if (!userId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details are required" });
    }

    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generateSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment Verification Failed" });
    }

    const existingPayment = await Payment.findOne({
      orderId: razorpay_order_id,
      userId,
    });

    if (!existingPayment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (existingPayment.status === "paid") {
      return res.status(200).json({ message: "Payment already verified" });
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id, userId, status: "created" },
      { status: "processing", paymentId: razorpay_payment_id },
      { new: true },
    );

    if (!payment) {
      return res.status(409).json({ message: "Payment verification is already in progress" });
    }

    let updatedUser;
    try {
      const { data } = await axios.post(
        `${process.env.AUTH_SERVICE}/update-plan`,
        {
          userId: payment.userId,
          plan: payment.plan,
          credits: payment.credits,
        },
      );
      updatedUser = data;
      await Payment.updateOne({ _id: payment._id, status: "processing" }, { status: "paid" });
    } catch (error) {
      await Payment.updateOne(
        { _id: payment._id, status: "processing" },
        { status: "created", $unset: { paymentId: 1 } },
      );
      throw error;
    }

    return res.status(200).json({
      message: "Payment Verified",
      user: updatedUser.user,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    console.error("Response:", error.response?.data);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : JSON.stringify(error.response?.data)) ||
        error.message ||
        "Internal server error",
    });
  }
};
