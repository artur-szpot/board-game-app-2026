FROM node:22

RUN useradd -ms /bin/sh -u 1001 app
USER app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY --chown=app:app . .

EXPOSE 3001

CMD npm run start:dev
