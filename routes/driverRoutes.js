const express = require('express');
const driverController = require('../controllers/driverController');

const router = express.Router();

router.post('/signup', driverController.signup);

module.exports = router;
