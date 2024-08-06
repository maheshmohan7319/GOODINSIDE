
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', verifyToken, authController.getUser);
router.put('/changePassword', verifyToken, authController.changePassword);
router.put('/updateProfile', verifyToken, authController.updateProfile);

module.exports = router;
