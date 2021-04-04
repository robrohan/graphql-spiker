FROM node:12.22.0-alpine3.10
ENV NODE_ENV=production

RUN apk update && \
  apk add gettext ca-certificates

WORKDIR /app

COPY ["./package.json", "./package-lock.json", "./"]

COPY ./src ./src
COPY ./repository ./repository

RUN npm install

CMD [ "node", "./src/index.js" ]
