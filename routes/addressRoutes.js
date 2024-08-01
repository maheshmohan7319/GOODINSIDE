
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyToken } = require('../middleware/auth');


router.post('/', verifyToken, addressController.createAddress);

router.get('/', verifyToken, addressController.getAddressesByUserId);

router.get('/:id', verifyToken, addressController.getAddressById);

router.put('/:id', verifyToken, addressController.updateAddress);

router.patch('/:id', verifyToken, addressController.updateIsDefaultAddress);

router.delete('/:id', verifyToken, addressController.deleteAddress);

module.exports = router;