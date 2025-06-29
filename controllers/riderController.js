const db = require("../models");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const Rider = db.Rider;
const Order = db.Order;
const Deadline = db.Deadline;

exports.loginRider = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  //check if its email or phone
  let condition = {};
  if (emailOrPhone.includes("@")) {
    condition.email = emailOrPhone;
  } else {
    condition.phone = emailOrPhone;
  }

  try {
    const rider = await Rider.findOne({ where: condition });
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found" } );
    }

    const isMatch = await bcrypt.compare(password, rider.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Successful login
    req.session.rider = {
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      photo: rider.photo
    };
    console.log("Rider logged in:", req.session.rider);
    return res.status(200).json({ success: true, message: "Login successful", rider: { id: rider.id, name: rider.name, phone: rider.phone } });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.logoutRider = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  });
};

exports.checkRiderSession = (req, res) => {
  if (req.session.rider) {
        console.log(req.session.rider);
    return res.status(200).json({
      success: true,
      rider: req.session.rider,
      isAuthenticated: true,
      message: "Rider session is active",
    });
  } else {
    return res.status(200).json({
      success: false,
      isAuthenticated: false,
      message: "Rider session is not active",
    });
  }
};

exports.fetchAssignments = async (req, res) => {
  try {
    const assignments = await Order.findAll({
      where: {
        assigned_rider_id: req.body.id,
      },
      include: [
        {
          model: Deadline,
          as: "deadlines",
          // attributes: ['id'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments: ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.viewAssignment = async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const assignment = await Order.findOne({
      where: { id: assignmentId },
      include: [
        {
          model: Deadline,
          as: "deadlines",
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.submitPickupOtp = async (req, res) => {
  const { otp, unique_id, id } = req.body;
  console.log("Received OTP:", otp, "for unique_id:", unique_id, "and id:", id);

  const t = await db.sequelize.transaction(); // Start a transaction

  try {
    // Find the order by ID within transaction
    const order = await Order.findOne({ where: { id }, transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify the OTP
    if (order.send_otp !== otp) {
      console.log("OTP not matching");
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. The OTP Did Not Match. It is incorrect.",
      });
    }

    // Update order status
    order.status = "picked";
    order.pickup_time = new Date(); 
    await order.save({ transaction: t });

    // Create delivery deadline
    // Calculate deadline_expire_time: 4 hours before customer_deadline
    const customerDeadline = order.customer_deadline;
    const deadlineExpireTime = new Date(
      new Date(customerDeadline).getTime() - 4 * 60 * 60 * 1000
    );

    await Deadline.create(
      {
        order_id: order.id,
        deadline_type: "delivery",
        status: "pending",
        deadline_expire_time: deadlineExpireTime,
        fullfilled_at: null,
        notified: false,
      },
      { transaction: t }
    );

    // Update pickup deadline
    const pickupDeadline = await Deadline.findOne({
      where: { order_id: order.id, deadline_type: "pickup" },
      transaction: t,
    });

    if (pickupDeadline) {
      pickupDeadline.status = "met";
      pickupDeadline.fullfilled_at = new Date();
      await pickupDeadline.save({ transaction: t });
    }

    await t.commit(); // Commit all changes

    res.status(200).json({
      success: true,
      message: "Delivery OTP verified successfully",
    });
  } catch (error) {
    await t.rollback(); // Rollback all changes on error
    console.error("Error submitting pickup OTP:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.generateDeliveryOtp = async (req, res) => {
  const { unique_id, id } = req.body;

  try {
    // Find the order by unique_id
    const order = await Order.findOne({
      where: { id, id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliver_otp) {
      return res.status(400).json({
        success: false,
        message: "Delivery OTP already generated for this order already",
      });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    order.deliver_otp = otp;
    await order.save();
    console.log(
      "Generated OTP:",
      otp,
      "for unique_id:",
      unique_id,
      "and id:",
      id
    );
    res.status(200).json({
      success: true,
      message: "Delivery OTP generated successfully",
      otp, // Return the OTP for client-side use
    });
  } catch (error) {
    console.error("Error generating delivery OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.submitDeliveryOtp = async (req, res) => {
  const { unique_id, id, deliveryOtp } = req.body;

  const t = await db.sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { id },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Order associated with the OTP not found",
      });
    }

    const deadline = await Deadline.findOne({
      where: { order_id: id, deadline_type: "delivery" },
      transaction: t,
    });

    if (!deadline) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Delivery deadline associated with the order not found",
      });
    }

    if (deliveryOtp !== order.deliver_otp) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. The OTP did not match!",
      });
    }

    // OTP matched — update order and deadline
    order.status = "delivered";
    order.delivery_time = new Date();
    await order.save({ transaction: t });

    deadline.status = "met";
    deadline.fulfilled_at = new Date();
    await deadline.save({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Delivery OTP verified successfully. Order has been delivered.",
    });

  } catch (error) {
    await t.rollback();
    console.error("Error submitting delivery OTP:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

