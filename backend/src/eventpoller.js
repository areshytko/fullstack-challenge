
'use strict';

/**
 * @fileoverview contains cron job to periodically poll outgoing
 * events collection in a database and send messages to the message broker.
 * @see Transactional Outbox and Polling Publisher patterns
 * @todo should be refactored to a separate service
 */

const amqp = require('amqplib');
const waitOn = require('wait-on');
const log4js = require('log4js');

const ReportEvent = require('./model/ReportEvent');

const logger = log4js.getLogger(__filename);


const waitForBroker = async (host) => {
    const broker = `tcp:${host}`;

    const waitOpts = {
        resources: [broker],
        interval: 1000,
        simultaneous: 1,
        tcpTimeout: 10000,
        timeout: 10000
    }

    return await waitOn(waitOpts);
};

/**
 * Starts and stops periodic job to poll events table and send messages
 * to the message broker.
 */
const EventPoller = {

    async _connectToMessageBroker(brokerHost, user, password) {
        try {
            await waitForBroker(brokerHost);
            logger.debug(`connecting to the message broker: ${brokerHost}`);
            this._amqpConnection = await amqp.connect(`amqp://${user}:${password}@${brokerHost}`);
            this._amqpChannel = await this._amqpConnection.createChannel();
            await this._amqpChannel.assertQueue(this._queueName);
            return true;
        }
        catch (err) {
            logger.error(err);
            return false;
        }
    },

    _send(event) {
        const result = this._amqpChannel.sendToQueue(this._queueName, Buffer.from(JSON.stringify(event)));
        logger.trace(`Message sent to ${this._queueName} : `, event);
        return result;
    },

    async _sendNewEvents() {
        try {
            const events = await ReportEvent.find().sort({ created_at: 1 }).limit(20).exec();
            events.forEach(async (event) => {
                if (this._send(event)) {
                    await ReportEvent.deleteOne({ _id: event._id });
                }
            });
        }
        catch (err) {
            logger.error("Error during event poll loop: ", err);
        }
    },

    /**
     * Start event polling job.
     * @param {number} pollingPeriod period to run the job
     * @param {*} brokerHost hostname:port of RabbitMQ broker
     * @param {*} user RabbitMQ credentials
     * @param {*} password RabbitMQ credentials
     * @param {*} queueName RabbitMQ queue name
     */
    async start(pollingPeriod, brokerHost, user, password, queueName) {

        this._queueName = queueName;

        this._sendNewEvents = this._sendNewEvents.bind(this);

        const connected = await this._connectToMessageBroker(brokerHost, user, password);
        if (connected) {
            this._timer = setInterval(this._sendNewEvents, pollingPeriod);
        }
        else {
            logger.fatal("Failed to connect to the message broker. Polling timer wasn't started");
        }
    },

    /**
     * Stop evetn polling job
     */
    stop() {
        clearInterval(this._timer);
    },

    _timer: null,
    _amqpConnection: null,
    _amqpChannel: null,
    _queueName: null
};

module.exports = EventPoller;
