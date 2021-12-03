const  Driver = require('../models/driverModel');
const catchAsync = require('./../utils/catchAsync');

// Driver signup
exports.signup = catchAsync(async (req, res, next) => {
  const newDriver = await Driver.create(req.body);
  res.status(200).json({
    status: 'success',
    data: newDriver
  });
});
