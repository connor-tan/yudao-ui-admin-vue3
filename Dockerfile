# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=xiaokanhui-admin-pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY . .

ARG ADMIN_BUILD_MODE=prod
ARG VITE_BASE_URL="http://localhost:48080"
ARG VITE_API_URL=/admin-api
ARG VITE_APP_TITLE=校刊汇管理系统

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_OUT_DIR=dist

RUN pnpm build:${ADMIN_BUILD_MODE}

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
