#!/bin/bash

while [[ $(docker ps --format '{{.Names}}' --filter='name=mongodb' > /dev/null && docker exec mongodb mongo --username $(cat ./secrets/MONGO_INITDB_ROOT_USERNAME) --password $(cat ./secrets/MONGO_INITDB_ROOT_PASSWORD) --quiet --eval 'rs.status().ok && rs.isMaster().ismaster') != 'true' ]];
do
    echo 'waiting...';
    sleep 2;
done
