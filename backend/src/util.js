
'use strict';

/**
 * @fileoverview Util functions used in other packages
 */

const HTTPErrors = require('http-errors');
const HTTPStatuses = require('statuses');


/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }
    else if (port >= 0) {
        // port number
        return port;
    }
    else return false;
};


/**
 * Final error handler express middleware
 */
const errorHandler = (err, req, res, next) => {

    let messageToSend;

    if (err instanceof HTTPErrors.HttpError) {
        // handle http err
        messageToSend = { message: err.message };

        if (process.env.NODE_ENV !== 'production')
            messageToSend.stack = err.stack;

        messageToSend.status = err.statusCode;
    }

    if (process.env.NODE_ENV === 'production' && !messageToSend) {
        messageToSend = { message: 'Unknown error', status: 500 };
    }

    if (messageToSend) {

        let statusCode = parseInt(messageToSend.status, 10);
        let statusName = HTTPStatuses(statusCode);

        res.status(statusCode);

        if (req.accepts('html')) {
            // send html
            res.send('<html><head><title>' + statusCode + ' ' + statusName + '</title></head><body><h1>' + statusCode + ' ' + statusName + '</h1>' + messageToSend.message + '<br/><br/>' + (messageToSend.stack ? messageToSend.stack : '') + '</body></html>');
        } else if (req.accepts('json')) {
            // send json
            let responseObject = { error: statusName, code: statusCode, message: messageToSend.message };

            if (messageToSend.stack)
                responseObject.stack = messageToSend.stack;

            res.send(responseObject);
        } else {
            // default to plain-text
            res.type('txt').send(statusName + ' ' + messageToSend.message);
        }
    }
    else {
        next(err);
    }
};

/**
 * Return array of unique array elements by some key
 * @param {!Array<Any>} arr input array
 * @param {function(Any): boolean} key key function
 */
const uniqueBy = (arr, key) => {
    const seen = {};
    return arr.filter((item) => {
        const k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}


module.exports = {
    normalizePort: normalizePort,
    errorHandler: errorHandler,
    uniqueBy: uniqueBy
};
