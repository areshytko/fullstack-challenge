/**
 * @jest-environment node
 */

'use strict';

const amqp = require('amqplib');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const Report = require('../model/Report');
const db = require('../db');
const config = require('../config');

var amqpConnection = null;
var amqpChannel = null;

beforeEach(async () => {
    db.init();
    const messageBrokerUrl = `amqp://${config.messageBrokerUser}:${config.messageBrokerPass}@${config.messageBrokerHost}`;
    amqpConnection = await amqp.connect(messageBrokerUrl);
    amqpChannel = await amqpConnection.createChannel();
    await amqpChannel.assertQueue(config.reportEventSinkQueue);
});

afterEach(() => {
    db.connection && db.connection.close();
    amqpConnection && amqpConnection.close();
});


test('that block and resolve API calls for report save data to DB and send messages to MB', async (done) => {

    const reportIds = ["6706b3ba-bf36-4ad4-9b9d-4ebf4f4e2429", "6706b3ba-bf36-4ad4-9b9d-4ebf4f4e2429"];
    const newStates = ['BLOCKED', 'RESOLVED'];

    const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);

    const token = jwt.sign(
        { role: 'admin', name: 'John Smith' },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: '7d' }
    );

    for (const x of zip(reportIds, newStates)) {
        let [reportId, newState] = x;

        const result = await axios.put(
            'http://127.0.0.1:8080/reports/' + reportId,
            { ticketState: newState },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        expect(result.status).toEqual(200);
        const report = await Report.findOne({ reportId: reportId }).exec();
        expect(report).toBeTruthy();
        expect(report.state).toEqual(newState);

        amqpChannel.consume(config.reportEventSinkQueue, message => {

            try {
                amqpChannel.ack(message);
                const event = JSON.parse(message.content.toString());
                expect(event.reportId).toEqual(reportId);
                expect(event.newState).toEqual(newState);
                done();
            }
            catch (err) {
                done(err);
            }
        });
    }
});
