
'use strict';

const mongoose = require('mongoose');

/**
 * Schema for Report collection
 */
const ReportSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        enum: ['OPEN', 'BLOCKED', 'RESOLVED'],
        index: true
    },
    message: {
        type: String,
    },
    reportType: {
        type: String,
        required: true,
        enum: ['SPAM', 'INFRINGES_PROPERTY', 'VIOLATES_POLICIES']
    },
    reportId: {
        type: String,
        required: true,
        index: true,
        unique: true,
        dropDups: true
    },
    resourceId: {
        type: String,
        required: true,
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['REPLY', 'ARTICLE', 'POST']
    },
});

const ReportModel = mongoose.model('Report', ReportSchema);

module.exports = ReportModel;
