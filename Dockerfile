FROM node:18-alpine

WORKDIR /app

COPY . .

COPY .env .

RUN npm install

RUN npm run build

EXPOSE $PORT

CMD [ "npm", "start" ]
