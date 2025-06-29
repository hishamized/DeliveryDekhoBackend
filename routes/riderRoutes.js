const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const riderController = require('../controllers/riderController');
const { requireRiderLogin } = require('../middleware/riderAuth');

router.get('/check-session', riderController.checkRiderSession);

router.post('/login', riderController.loginRider);

router.post('/logout', requireRiderLogin, riderController.logoutRider);

router.post('/fetch-assignments',requireRiderLogin, riderController.fetchAssignments);

router.get('/viewAssignment/:id', requireRiderLogin, riderController.viewAssignment);

router.post('/submitPickupOtp', requireRiderLogin, riderController.submitPickupOtp);

router.post('/generateDeliveryOtp', requireRiderLogin, riderController.generateDeliveryOtp);

router.post('/submitDeliveryOtp', requireRiderLogin, riderController.submitDeliveryOtp);

module.exports = router;
