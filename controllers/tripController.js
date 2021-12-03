const Driver = require('../models/driverModel');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// Fetching cabs near to user location
exports.cabsNearby = catchAsync( async (req,res,next) => {

    const {latlng} = req.params;  
    const [lat, lng] = latlng.split(',');
  
    if(!lat || !lng) next(new AppError('please provide latitude and longitude',400));
    
    const radius = 4/6378.1;  // within Km 
  
    const cabs = await Driver.find({
      available: true,
      location: {
        $geoWithin: { $centerSphere: [ [lng,lat], radius ]  }
      }
    });
    
    if(cabs.length === 0) {

    return res.status(200).json({
        status: 'success',
        data: 'cabs are busy please try again'
      });
    }

      res.status(200).json({
        status: 'success',
        results: cabs.length,
        data: cabs
      });
  
  });
  
  // fetch cabs nearby and sort by distance
  exports.sortCabs = catchAsync( async(req,res,next) => {
  
    const {pickup} = req.params;  
    const [lat, lng] = pickup.split(',');
  
    if(!lat || !lng) next(new AppError('please provide latitude and longitude',400));
  
    const cabs = await Driver.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          maxDistance: 4000,
          distanceMultiplier: 0.001
        }
      },
  
      {
        $match: {available: true}
      },
      {
        $project: {
          distance: 1,
          name: 1,
          available: 1,
          location:1
        }
      }
    ]);
    
    req.query.cabs = cabs;
    next();
  
  });
  
  // Book cab based on driver response
  exports.bookCab = catchAsync( async (req,res,next) => {
  
    let cabBooked = false;
    
    // Dummy Notification
    const notifyDriver = (cab) => {
      req.query.cab = cab;
      cabBooked = true;
      return true;
    }
  
    const cabs = req.query.cabs;
  
    for(let i=0; i<cabs.length; i++) {

      if(notifyDriver(cabs[i])) break;
    }
  
    // If drivers are busy
    if(!cabBooked) {
      res.status(200).json({
        status: 'success',
        data: 'Drivers are busy please try again'
      });
    } 

    next();
  });


  // save trip details to database and send book conformation
  exports.saveTrip = catchAsync (async (req,res,next)=> {

    const {pickup,drop } = req.params;
    const from = pickup.split(',').reverse();
    const to = drop.split(',').reverse();
    
    let tripDistance;
    function distance(lat1, lon1, lat2, lon2) {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p)/2 + 
                c(lat1 * p) * c(lat2 * p) * 
                (1 - c((lon2 - lon1) * p))/2;
      
        return tripDistance = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
      }

      distance(from[0]*1,from[1]*1,to[0]*1,to[1]*1);

      const fare = Math.ceil(10*tripDistance);

    const trip = await Trip.create({
         fare,
        "from": { "type": "Point", "coordinates": from  },
        "to": {"type": "Point", "coordinates": to},
        "user": req.user._id
    });

     // cab booked
     res.status(200).json({
        status: 'Cab booked successfully',
        data: {
            trip
        }
      });

  });


  // fetach all trips based on user Id 
  exports.getMyTrips = catchAsync(async (req,res,next) => {

    const userTrips = await User.findById(req.user._id).populate('trips').select('trips');

    if(!userTrips) next(new AppError('please try again',400));

    res.status(200).json({
        status: 'success',
        results: userTrips.trips.length,
        trips: userTrips.trips
      });
  });

  exports.getAlltrips = catchAsync(async (req,res,next) => {

    // query trips and add limit to query
    let query =  Trip.find();

    // pagiation 
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // await query after adding limit to query
    const trips = await query;

    if(!trips) next(new AppError('please try again',400));

    res.status(200).json({
        status: 'success',
        results: trips.length,
        data: trips
      });
  });