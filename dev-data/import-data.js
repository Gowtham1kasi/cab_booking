const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/tripModel');
const Driver = require('./models/driverModel');
const User = require('./models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE

const trips = JSON.parse(fs.readFileSync(`${__dirname}/trips.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const drivers = JSON.parse(fs.readFileSync(`${__dirname}/drivers.json`, 'utf-8'));

// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Trip.create(trips);
    await User.create(users, { validateBeforeSave: false });
    await Driver.create(drivers,{ validateBeforeSave: false });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Trip.deleteMany();
    await User.deleteMany();
    await Driver.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
