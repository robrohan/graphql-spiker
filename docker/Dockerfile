FROM node:12.18.1
ENV NODE_ENV=production

RUN apt-get update && \
  apt-get install gettext ca-certificates 

WORKDIR /app

COPY ["./src/package.json", "./src/package-lock.json", "./"]

RUN npm install

COPY ./src .

CMD [ "node", "index.js" ]
