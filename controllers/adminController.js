const db = require("../models");
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require('fs');
const deadline = require("../models/deadline");


const Admin = db.Admin;

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found, Please check your email",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Set session
    req.session.admin = {
      id: admin.id,
      name: admin.name,
      role: admin.role,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.logoutAdmin = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};

exports.checkAdminSession = (req, res) => {
   if (req.session.admin) {
    return res.status(200).json({ loggedIn: true, admin: req.session.admin });
  }
  return res.status(200).json({ loggedIn: false });
};



exports.registerAdmin = async (req, res) => {
  const { name, phone, email, address, password, role, is_active } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    !password ||
    !role ||
    is_active === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    const existingPhone = await Admin.findOne({ where: { phone } });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this phone number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      phone,
      email,
      address,
      password_hash: hashedPassword,
      role,
      is_active,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "New passwords do not match",
    });
  }

  try {
    const adminId = req.session.admin.id;
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password_hash = hashedNewPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.addRider = async (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    password,
    driver_license_number,
    vehicle_registration_number,
    adhaar_number, pan_card_number
  } = req.body;

  const photoPath = req.file ? path.normalize(req.file.path).replace(/\\/g, '/') : null;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    !password ||
    !driver_license_number ||
    !vehicle_registration_number
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingRider = await db.Rider.findOne({ where: { phone } });
    const existingEmail = await db.Rider.findOne({ where: { email } });
    const existingLicense = await db.Rider.findOne({
      where: { driver_license_number },
    });



    if (existingRider) {
      return res.status(409).json({
        success: false,
        message: "Rider already exists with this phone number",
      });
    }

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Rider already exists with this email",
      });
    }

    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: "Rider already exists with this driver license number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRider = await db.Rider.create({
      name,
      phone,
      email,
      address,
      password_hash: hashedPassword,
      driver_license_number,
      vehicle_registration_number,
      adhaar_number,
      pan_card_number,
      photo: photoPath, // Save the photo path if uploaded
      availability_status: true, // Default to available
      is_active: true, // Default to active
    });

    return res.status(201).json({
      success: true,
      message: "Rider added successfully",
      rider: {
        id: newRider.id,
        name: newRider.name,
        phone: newRider.phone,
        email: newRider.email,
      },
    });
  } catch (error) {
    console.error("Add rider error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

exports.getRiderList = async (req, res) => {
  console.log("Fetching rider list...");
  try {
    const riders = await db.Rider.findAll({
      attributes: [
        'id',
        'name',
        'phone',
        'email',
        'driver_license_number',
        'vehicle_registration_number',
        'availability_status',
        'is_active',
      ],
    });

    console.log("Riders fetched:", riders);

    return res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.error("Get rider list error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

exports.getRiderById = async (req, res) => {
  try {
    const rider = await db.Rider.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'phone',
        'email',
        'address',
        'driver_license_number',
        'vehicle_registration_number',
        'adhaar_number',
        'pan_card_number',
        'photo',
        'availability_status',
        'is_active',
      ],
    });

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    res.json({ rider });
  } catch (err) {
    console.error("Get rider by ID error:", err);
    res.status(500).json({ error: 'Failed to fetch rider' });
  }
};

exports.updateRider = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    email,
    address,
    driver_license_number,
    vehicle_registration_number,
    availability_status,
    is_active,
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    !driver_license_number ||
    !vehicle_registration_number
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const rider = await db.Rider.findByPk(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.name = name;
    rider.phone = phone;
    rider.email = email;
    rider.address = address;
    rider.driver_license_number = driver_license_number;
    rider.vehicle_registration_number = vehicle_registration_number;
    rider.availability_status = availability_status;
    rider.is_active = is_active;

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Rider updated successfully",
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
      },
    });
  } catch (error) {
    console.error("Update rider error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteRider = async (req, res) => {
  const { id } = req.params;
  console.log("Deleting rider with ID:", id, typeof id);

  try {
    const rider = await db.Rider.findByPk(Number(id));

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

     if (rider.photo) {
      const photoPath = path.join(__dirname, '..', rider.photo.replace(/\\/g, '/'));
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error("Failed to delete rider photo:", err.message);
        } else {
          console.log("Rider photo deleted:", photoPath);
        }
      });
    }

    await rider.destroy();
   
    return res.status(200).json({
      success: true,
      message: "Rider deleted successfully",
    });
  } catch (error) {
    console.error("Delete rider error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.placeOrder = async (req, res) => {
  console.log("📥 Full req.body:", req.body);

  const {
    sender_name,
    receiver_name,
    source_address,
    dest_address,
    phone_sender,
    phone_receiver,
    send_otp,
    assigned_rider_id,
    customer_deadline,
    deadline_type,
    deadline_expire_time
  } = req.body;

  if (
    !sender_name ||
    !receiver_name ||
    !source_address ||
    !dest_address ||
    !phone_sender ||
    !phone_receiver ||
    !send_otp
    || (assigned_rider_id && isNaN(assigned_rider_id)) 
    || (customer_deadline && isNaN(Date.parse(customer_deadline))) 
    || (deadline_type && !['pickup', 'delivery'].includes(deadline_type)) 
    || (deadline_expire_time && isNaN(Date.parse(deadline_expire_time)))
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const t = await db.sequelize.transaction(); // Start transaction

  try {
    const newOrder = await db.Order.create({
      sender_name,
      receiver_name,
      source_address,
      dest_address,
      phone_sender,
      phone_receiver,
      send_otp,
      assigned_rider_id: assigned_rider_id || null,
      assigned_time: new Date(), 
      customer_deadline: customer_deadline || null,
    }, { transaction: t });

    console.log("📅 deadline_expire_time:", deadline_expire_time);

    const newDeadline = await db.Deadline.create({
      order_id: newOrder.id,
      deadline_type: deadline_type || 'pickup',
      status: 'pending',
      deadline_expire_time: deadline_expire_time ? new Date(deadline_expire_time) : null,
    }, { transaction: t });

    await t.commit(); 

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: newOrder.id,
        unique_id: newOrder.unique_id,
        source_address: newOrder.source_address,
        dest_address: newOrder.dest_address,
        phone_sender: newOrder.phone_sender,
        phone_receiver: newOrder.phone_receiver,
        send_otp: newOrder.send_otp,
        status: newOrder.status,
        assigned_rider_id: newOrder.assigned_rider_id,
        customer_deadline: newOrder.customer_deadline,
      },
    });
  } catch (error) {
    await t.rollback(); 
    console.error("Place order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getOrders = async (req, res) => {
  console.log("Fetching orders...");
  try {
    const orders = await db.Order.findAll({
      attributes: [
        'id',
        'unique_id',
        'source_address',
        'dest_address',
        'phone_sender',
        'phone_receiver',
        'send_otp',
        'status',
        'assigned_rider_id',
        'customer_deadline',
      ],
      include: [{
        model: db.Deadline,
        as: 'deadlines',
        attributes: ['deadline_type', 'status', 'deadline_expire_time'],
      }],
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        {
          model: db.Deadline,
          as: 'deadlines',
          attributes: ['id', 'deadline_type', 'status', 'deadline_expire_time'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  console.log("Deleting order with ID:", id, typeof id);

  const t = await db.sequelize.transaction();

  try {
    const order = await db.Order.findByPk(Number(id), { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete associated deadlines
    await db.Deadline.destroy({
      where: { order_id: order.id },
      transaction: t,
    });

    // Delete the order itself
    await order.destroy({ transaction: t });

    // Commit the transaction
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Order and associated deadlines deleted successfully",
    });

  } catch (error) {
    await t.rollback();
    console.error("Delete order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    source_address,
    dest_address,
    phone_sender,
    phone_receiver,
    status,
    payment_status,
  } = req.body;

  if (
    !source_address ||
    !dest_address ||
    !phone_sender ||
    !phone_receiver ||
    !status ||
    !payment_status
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const order = await db.Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.source_address = source_address;
    order.dest_address = dest_address;
    order.phone_sender = phone_sender;
    order.phone_receiver = phone_receiver;
    order.status = status;
    order.payment_status = payment_status || 'no';

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: {
        id: order.id,
        unique_id: order.unique_id,
        source_address: order.source_address,
        dest_address: order.dest_address,
        phone_sender: order.phone_sender,
        phone_receiver: order.phone_receiver,
        send_otp: order.send_otp,
        status: order.status,
        assigned_rider_id: order.assigned_rider_id,
        customer_deadline: order.customer_deadline,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

exports.getDeadlines = async (req, res) => {
  try {
const deadlines = await db.Deadline.findAll({
  where: { status: 'missed' },
  order: [['created_at', 'DESC']]
});


    if (!deadlines.length) {
      return res.status(404).json({
        success: false,
        message: "No missed deadlines found."
      });
    }

    await Promise.all(deadlines.map(dl => {
  dl.notified = true;
  return dl.save();
}));


    return res.status(200).json({
      success: true,
      message: "Missed deadlines retrieved and marked as notified.",
      deadlines
    });

  } catch (error) {
    console.error("Error fetching deadlines:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching deadlines.",
      error: error.message || "Internal Server Error"
    });
  }
};




