const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const driverRouter = require('./routes/driverRoutes');
const tripRouter = require('./routes/tripRoutes');

const app = express();

// swagger
// swagger Documentation path
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));


// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Limit requests from same API (Rate limiter)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/drivers', driverRouter);
app.use('/api/v1/trips', tripRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
