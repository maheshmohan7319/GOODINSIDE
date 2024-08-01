const express = require('express');
const productController = require('../controllers/productController');
const { verifyToken, checkAdmin, verifyOptionalToken } = require('../middleware/auth');

const router = express.Router();

router.get('/',verifyOptionalToken, productController.getProducts);

router.get('/:id',verifyOptionalToken, productController.getProductById);

router.post('/', verifyToken, checkAdmin, productController.createProduct);

router.put('/:id', verifyToken, checkAdmin, productController.updateProduct);

router.delete('/:id', verifyToken ,checkAdmin, productController.deleteProduct);



module.exports = router;
