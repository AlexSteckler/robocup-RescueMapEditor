FROM node:16-slim as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:1.17.1-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/rescue-map-creator /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
