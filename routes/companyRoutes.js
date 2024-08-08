const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, checkAdmin } = require('../middleware/auth');

router.post('/',verifyToken,checkAdmin, companyController.createOrUpdateCompany);

module.exports = router;