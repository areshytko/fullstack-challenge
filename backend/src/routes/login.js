/**
 * @fileoverview provides mock authentication endpoint
 * for the development environment.
 */

'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const log4js = require('log4js');

const config = require('../config');

const logger = log4js.getLogger(__filename);

const router = express.Router();


router.post('/', (req, res) => {
    logger.debug(req.query.returnTo);
    const token = jwt.sign(
        { role: 'admin', name: 'John Smith' },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: '7d' }
    );
    res.cookie('jwt', token);
    res.redirect(req.query.returnTo);
});

module.exports = router;