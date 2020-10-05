FROM node:14.11-alpine
ARG BUILDTYPE

ENV NODE_ENV ${BUILDTYPE}
ENV STATIC_DIR "/app/static"

WORKDIR /app
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm install

COPY ["./backend/src", "./src"]

COPY ["./frontend/dist", "./static"]

CMD ["npm", "run", "serve"]