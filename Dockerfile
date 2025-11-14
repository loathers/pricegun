FROM node:23-alpine
COPY . /app/
WORKDIR /app
RUN corepack enable
RUN yarn install
RUN yarn build
RUN yarn prisma migrate deploy
EXPOSE 3000
CMD ["yarn", "start"]
