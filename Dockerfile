FROM node:23-alpine
COPY . /app/
WORKDIR /app
RUN corepack enable
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
