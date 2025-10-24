FROM node:24-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

RUN corepack enable
RUN yarn install --immutable
RUN yarn prisma migrate deploy

CMD ["yarn", "start"]
