const express = require('express');
const tripController = require('../controllers/tripController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/cabs-nearby/:latlng',tripController.cabsNearby );
router.get('/bookcab/pickup/:pickup/drop/:drop',authController.protect,tripController.sortCabs, tripController.bookCab, tripController.saveTrip );
router.get('/mytrips',authController.protect,tripController.getMyTrips );
router.get('/',tripController.getAlltrips );


module.exports = router;
