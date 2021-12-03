const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    default: Math.random().toString(36).substr(2,9)
  },
  from: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  },
  to: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  },
  date: {
      type: Date,
      default: Date.now
  },
  fare: {
      type:Number,
      required: [true, ' A trip must have a  fare']
  },
  user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'trip must have a user']
  }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);

// populating Users
tripSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});

//index
tripSchema.index({location: '2dsphere'});

// Document middleware
const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
