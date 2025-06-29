const express = require('express');
const router = express.Router();
const { requireAdminLogin } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const adminController = require('../controllers/adminController');
const riderController = require('../controllers/riderController');

router.get('/check-session', adminController.checkAdminSession);

router.post('/login', adminController.loginAdmin);

router.post('/logout', requireAdminLogin, adminController.logoutAdmin);

router.post('/register', requireAdminLogin, adminController.registerAdmin);

router.post('/change-password', adminController.changePassword);


router.post('/add-rider', requireAdminLogin, upload.single('photo'), adminController.addRider);

router.get('/riders', requireAdminLogin, adminController.getRiderList);

router.get('/rider/:id', requireAdminLogin, adminController.getRiderById);

router.put('/rider/:id', requireAdminLogin, adminController.updateRider);

router.delete('/delete-rider/:id', requireAdminLogin, adminController.deleteRider);

router.post('/placeOrder', requireAdminLogin, adminController.placeOrder);

router.get('/getOrders', requireAdminLogin, adminController.getOrders);

router.get('/getOrder/:id', requireAdminLogin, adminController.getOrderById);

router.delete('/deleteOrder/:id', requireAdminLogin, adminController.deleteOrder);

router.put('/updateOrder/:id', requireAdminLogin, adminController.updateOrder);

router.get('/getDeadlines', requireAdminLogin, adminController.getDeadlines);

// Cloning 3 Rider routes for Admin Control Panel
router.post('/submitPickupOtp', requireAdminLogin, riderController.submitPickupOtp);

router.post('/generateDeliveryOtp', requireAdminLogin, riderController.generateDeliveryOtp);

router.post('/submitDeliveryOtp', requireAdminLogin, riderController.submitDeliveryOtp);


module.exports = router;
