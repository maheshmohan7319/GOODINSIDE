const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');


router.post('/', verifyToken, cartController.addItemToCart);

router.get('/', verifyToken, cartController.getCart);

router.get('/:id/:qty', verifyToken, cartController.getCartByProductId);

router.delete('/', verifyToken, cartController.removeItemFromCart);

router.put('/', verifyToken, cartController.updateCartItemQuantity);

module.exports = router;
