
'use strict';

var jwt = require('express-jwt');
const HTTPErrors = require('http-errors');
const log4js = require('log4js');

const config = require('./config');

const logger = log4js.getLogger(__filename);

/**
 * JWT-based authentication express middleware
 */
const authentication = jwt({ secret: config.jwtSecret, algorithms: ['HS256'] });


/**
 * Role-based authorization express middleware
 * @param  {...string} roles for which access to the resource is permitted
 */
const authorizeByRole = (...permittedRoles) => {
    return (req, res, next) => {
        const { user } = req;
        logger.trace(`request made by user: ${user.name}, role: ${user.role}`);
        if (user && permittedRoles.includes(user.role)) {
            next();
        } else {
            logger.info(`Unauthorized request by user: ${user.name} with role: ${user.role}`);
            next(HTTPErrors(403));
        }
    };
}

module.exports = {
    authentication: authentication,
    authorizeByRole: authorizeByRole
};
