#!/usr/bin/env node

/**
 * CLI to inspect outgoing events by the spam resolution service
 */

'use strict';

const amqp = require('amqplib');
const config = require('../config');

const getMessages = async (broker_url, queue_name) => {
    try {
        const connection = await amqp.connect(broker_url);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue_name);

        channel.consume(queue_name, message => {
            console.log("Message received: ", JSON.parse(message.content.toString()));
            channel.ack(message);
        });

        console.log(`Listening on: ${broker_url} ${queue_name}`);

    }
    catch (err) {
        console.log(err);
    }
};


const messageBrokerUrl = `amqp://${config.messageBrokerUser}:${config.messageBrokerPass}@${config.messageBrokerHost}`;
getMessages(messageBrokerUrl, config.reportEventSinkQueue);

