const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getMe = catchAsync( async(req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ 
    status: 'success',
    data: user
  });
});

