#!/bin/bash

set -e
set -x

# install git
sudo apt-get update
sudo apt-get install git

# install node.js and npm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
source /root/.nvm/nvm.sh
nvm install 11.11.0
nvm use 11.11.0

# install app
git clone https://github.com/areshytko/fullstack-challenge.git
cd fullstack-challenge/backend
npm i
npm run demo