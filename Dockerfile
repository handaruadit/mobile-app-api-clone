FROM node:18.13.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm add -g pm2 cross-env && pm2 install typescript


# DEPENDENCIES
FROM base AS dependencies

WORKDIR /app

ARG NPM_TOKEN

RUN mkdir -p /app

COPY package.json pnpm-lock.yaml /app/

RUN  echo "@displayeo:registry=https://npm.masjidway.me/" > /app/.npmrc \
  && echo "always-auth=true" >> /app/.npmrc \
  && echo "//npm.masjidway.me/:_authToken=${NPM_TOKEN}" >> /app/.npmrc

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


# APP
FROM base

WORKDIR /app

COPY --from=dependencies /app/node_modules /app/node_modules

ADD . /app

RUN rm -rf /app/.npmrc \
    && npm run prestart

VOLUME /data

EXPOSE 8080

CMD ["pm2-docker", "process.yml"]
