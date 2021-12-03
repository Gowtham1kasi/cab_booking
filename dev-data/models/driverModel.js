const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name '],
    unique: true,
  },
  cabModel: {
    type: String,
    required: [true, 'please provide cab model']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: [true, 'This mail is already in use'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  available: {
      type: Boolean,
      default: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords must be same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//index
driverSchema.index({location: '2dsphere'});

// Document middleware
// driverSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });

// driverSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();

//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// query middleware
driverSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

driverSchema.methods.correctPassword = async function (
  candidatePassword,
  driverPassword
) {
  return await bcrypt.compare(candidatePassword, driverPassword);
};

driverSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp;
  }
  return false;
};

driverSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;
  return resetToken;
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
