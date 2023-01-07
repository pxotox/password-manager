# Dockerfile# Pull the base image
FROM node:latest

WORKDIR /src/app

COPY ./package*.json ./

RUN npm install

CMD npm start --host 0.0.0.0 --port 3000 --disableHostCheck true
