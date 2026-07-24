FROM node:23-alpine
RUN apk add --no-cache curl
COPY . /app/
WORKDIR /app
RUN corepack enable
RUN yarn install
RUN yarn build
RUN yarn kysely migrate:latest
EXPOSE 3000
CMD ["yarn", "start"]
