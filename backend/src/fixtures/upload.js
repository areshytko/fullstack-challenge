#!/usr/bin/env node

/**
 * CLI to upload test data into MongoDB.
 * Usage: cd <project-root>/backend && ./src/upload.js
*/

'use strict';

const path = require('path');
const fs = require('fs').promises;
const log4js = require('log4js');

const db = require('../db');
const Report = require('../model/Report');
const ReportEvent = require('../model/ReportEvent');
const { uniqueBy } = require('../util');

log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: 'debug' } }
});

const readReports = async (reportsFile) => {
    const data = await fs.readFile(reportsFile, 'utf8');
    const obj = JSON.parse(data);
    return obj.elements;
};

const parseReport = (report) => {
    return new Report({
        state: report.state,
        reportType: report.payload.reportType,
        reportId: report.payload.reportId,
        resourceId: report.payload.referenceResourceId,
        resourceType: report.payload.referenceResourceType,
        message: report.payload.message
    });
};

const reportsFile = path.join(path.dirname(__filename), 'reports.json');

const main = async (reportsFile) => {

    db.init();

    try {

        await ReportEvent.createCollection();

        let rawReports = await readReports(reportsFile);
        rawReports = uniqueBy(rawReports, x => x.payload.reportId);
        const reports = rawReports.map(parseReport);
        await Promise.all(reports.map(report => report.save()));
        console.log("Successfully uploaded fixture data to the database");
    }
    catch (err) {
        console.log("Failed to upload fixture data to the database");
        console.log(err);
        process.exit(1);
    }

    db.connection.close();
};

main(reportsFile);
