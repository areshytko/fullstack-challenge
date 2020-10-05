
'use strict';

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { normalizePort } = require('./util');

dotenv.config();

/**
 * Provides access to all configuration data
 */
const Config = {
    databaseUrl: process.env.DATABASE_URL,
    databaseUser: fs.readFileSync(process.env.MONGO_USERNAME_FILE, { encoding: 'utf8' }),
    databasePass: fs.readFileSync(process.env.MONGO_PASSWORD_FILE, { encoding: 'utf8' }),
    port: normalizePort(process.env.PORT),
    public_dir: process.env.STATIC_DIR || path.resolve(__dirname, '..', '..', 'frontend', 'dist'),
    eventPollingInterval: 5000,
    messageBrokerHost: process.env.MB_HOST,
    messageBrokerUser: fs.readFileSync(process.env.RABBITMQ_USER_FILE, { encoding: 'utf8' }),
    messageBrokerPass: fs.readFileSync(process.env.RABBITMQ_PASS_FILE, { encoding: 'utf8' }),
    reportEventSinkQueue: process.env.SINK_QUEUE,
    withoutEventPolling: Boolean(process.env.WITHOUT_EVENT_POLLER),
    jwtSecret: process.env.JWT_SECRET,
    logLevel: process.env.LOG_LEVEL
};

module.exports = Config;
