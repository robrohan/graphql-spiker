FROM node:12.22.0-alpine3.10

ENV NODE_ENV=production
ENV REPO=example
ENV PORT=4000

RUN apk update && \
  apk add gettext ca-certificates

WORKDIR /app

COPY ["./package.json", "./package-lock.json", "./"]

COPY ./dist ./dist
COPY ./repository ./repository

RUN npm install

CMD [ "node", "./dist/spiker.js" ]
