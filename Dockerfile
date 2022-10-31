# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.14.2

FROM $NODE_VERSION AS deps-base

RUN corepack enable

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the deps
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm i --frozen-lockfile

FROM deps-base AS prod-base

ARG NUXT_PUBLIC_PROXY_URL=http://localhost:3001
ENV NUXT_PUBLIC_PROXY_URL=${NUXT_PUBLIC_PROXY_URL}

COPY . .
RUN pnpm build && pnpm -r build

RUN mkdir /dist
RUN cp -r .output /dist/app
RUN cp -r proxy/.output/ /dist/proxy
RUN cp -r worker/.output/ /dist/worker
RUN cp docker-entry.sh /dist/start.sh

FROM $NODE_VERSION-slim AS production

COPY --from=prod-base /dist /app

VOLUME /data
RUN mkdir -p /data/worker/ && ln -s /data/worker/ /app/worker/data

# Service hostname
ENV NUXT_HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0

# Service version
ARG NUXT_APP_VERSION
ENV NUXT_APP_VERSION=${NUXT_APP_VERSION}

# Run in production mode
ENV NODE_ENV=production

# Default configuration
ARG NUXT_PUBLIC_PROXY_URL=http://localhost:3001
ENV NUXT_PUBLIC_PROXY_URL=${NUXT_PUBLIC_PROXY_URL}
ENV NITRO_WORKER_PROXY_URL=http://localhost:3001
ENV NUXT_PUBLIC_WORKER_URL=http://localhost:3002

# start the app
CMD [ "bash", "/app/start.sh" ]