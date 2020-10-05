
/**
 * @fileoverview provides end points for static frontend resources
 * @todo should not be used in production.
 */

'use strict';

const path = require('path');
const express = require('express');

const config = require('../config');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.sendFile(path.join(config.public_dir, 'index.html'));
});

module.exports = router;
