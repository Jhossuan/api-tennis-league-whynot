FROM node:18-alpine

WORKDIR /app

COPY .env .

COPY . .

RUN npm install

RUN npm run build

EXPOSE $PORT

CMD [ "npm", "start" ]