FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache openssl wget && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/hms.key \
      -out /etc/nginx/ssl/hms.crt \
      -subj "/C=IN/ST=AndhraPradesh/L=Eluru/O=MahalakshmiHospital/CN=hms.mahalakshmihospital-eluru.in"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-check-certificate -qO- https://localhost/api/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
