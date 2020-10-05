
/**
 * @fileoverview endpoints for the Report resource.
 */

'use strict';

const express = require('express');
const createError = require('http-errors');
const Joi = require('joi');
const log4js = require('log4js');

const Report = require('../model/Report');
const ReportEvent = require('../model/ReportEvent');
const db = require('../db');

const logger = log4js.getLogger(__filename);

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const openReports = await Report.find().or([{ state: "OPEN" }, { state: "BLOCKED" }]).exec();
        const result = openReports.map(report => {
            return {
                state: report.state,
                reportType: report.reportType,
                message: report.message,
                reportId: report.reportId
            };
        });
        res.json({ code: 200, payload: result });
    }
    catch (err) {
        logger.error(err);
        next(createError(500));
    }
});

router.get('/:reportId', (req, res, next) => {
    next(createError(501));
});

router.post('/:reportId', (req, res, next) => {
    next(createError(501));
});

const putReportSchema = Joi.object({
    ticketState: Joi.string()
        .pattern(new RegExp('^(OPEN|BLOCKED|RESOLVED)$'))
        .required()
});

router.put('/:reportId', async (req, res, next) => {
    try {

        const { error } = putReportSchema.validate(req.body);

        if (error) {
            logger.error(error.details[0].message);
            return next(createError(400, error.details[0].message));
        }

        var session = await db.connection.startSession();
        session.startTransaction();

        const report = await Report.findOneAndUpdate(
            { reportId: req.params.reportId },
            { state: req.body.ticketState },
        ).session(session).exec();

        if (report) {
            await ReportEvent.create([{
                newState: req.body.ticketState,
                reportId: req.params.reportId,
                eventType: 'REPORT_STATE_CHANGE',
            }], { session: session });
        }

        await session.commitTransaction();

        if (report) {
            res.json({ code: 200 });
        }
        else {
            next(createError(404, "Report not found"));
        }
    }
    catch (err) {
        logger.error(err);
        await session.abortTransaction();
        next(createError(500));
    }
    finally {
        session.endSession();
    }
});


module.exports = router;
