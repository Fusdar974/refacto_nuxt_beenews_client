FROM node:lts-slim

ADD . /root/volume

WORKDIR /root/volume

RUN npm i
RUN npm run build

EXPOSE 3000
