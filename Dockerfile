FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS development-dependencies-env
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build-env
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN pnpm run build

FROM base
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
USER node
# The server binary directly: pnpm itself is not in the image (corepack would download it at each start).
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
