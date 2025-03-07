const express = require('express');
const userController = require('../controllers/UserController');
const dataController = require('../controllers/DataController');
const router = express.Router()

router.post('/register', userController.userRegister);
router.post('/login',userController.userLogin);
router.post('/send-otp',userController.sendOtp)
router.post('/verify-otp',userController.verifyOtp)
router.post('/reset-password',userController.resetPassword)

router.get('/data',dataController.data);
router.get('/colleges/:id',dataController.getCollegesByLevelId)
router.get('/getEntranceExams/:id',dataController.getEntranceExamsById)
router.get('/getDataForJob',dataController.getDetailsForJob)

// Correctly export the router instance
module.exports = router; // Ensure this is router, not an object
