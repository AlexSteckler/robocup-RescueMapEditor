FROM node:16-slim as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:16-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./
RUN npm install --only=prod
EXPOSE 3000
CMD ["node", "dist/main"]
