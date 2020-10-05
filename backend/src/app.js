
'use strict';

const HTTPErrors = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const loggerMiddleware = require('morgan');
const log4js = require('log4js');

const config = require('./config');
const { authentication, authorizeByRole } = require('./auth');
const indexRouter = require('./routes/index');
const reportsRouter = require('./routes/reports');
const loginRouter = require('./routes/login');
const db = require('./db');
const EventPoller = require('./eventpoller');
const { errorHandler } = require('./util.js');

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: ['console'], level: config.logLevel } }
});


// Initialize database connection
db.init();

// Start event poller
if (!config.withoutEventPolling) {
  EventPoller.start(
    config.eventPollingInterval,
    config.messageBrokerHost,
    config.messageBrokerUser,
    config.messageBrokerPass,
    config.reportEventSinkQueue
  );
}

const app = express();

// Setup Middleware
app.use(loggerMiddleware('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(config.public_dir));
app.use(/\/reports.*/, authentication);
app.use(/\/reports.*/, authorizeByRole('auditor', 'admin'));

// Setup routes
app.use('/', indexRouter);
app.use('/reports', reportsRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(HTTPErrors(404, "Resource for that route was not found"));
});

app.use(errorHandler);

module.exports = app;
