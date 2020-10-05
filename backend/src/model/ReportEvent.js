
'use strict';

const mongoose = require('mongoose');

/**
 * Schema for ReportEvent collection
 */
const ReportEventSchema = new mongoose.Schema({
    newState: {
        type: String,
        required: true,
        enum: ['OPEN', 'BLOCKED', 'RESOLVED']
    },
    reportId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['REPORT_STATE_CHANGE']
    },
    version: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ReportEventModel = mongoose.model('ReportEvent', ReportEventSchema);

module.exports = ReportEventModel;
