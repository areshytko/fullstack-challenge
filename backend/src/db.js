
'use strict';

/**
 * @fileoverview abstractions for connection to MongoDB
 */

const mongoose = require('mongoose');
const log4js = require('log4js');

const config = require('./config');


const logger = log4js.getLogger(__filename);

module.exports = {
    connection: null,
    async init() {
        try {
            const mongoDB = config.databaseUrl;
            logger.debug(`Connecting to database: ${config.databaseUrl}`);
            await mongoose.connect(mongoDB, {
                auth: {
                    authSource: "admin"
                },
                useNewUrlParser: true,
                useUnifiedTopology: true,
                user: config.databaseUser,
                pass: config.databasePass
            });

            const db = mongoose.connection;

            //Bind connection to error event (to get notification of connection errors)
            db.on('error', console.error.bind(console, 'MongoDB connection error:'));

            this.connection = db;
        }
        catch (err) {
            logger.fatal("Connection to the Database failed");
            logger.error(err);
        }
    }
};
