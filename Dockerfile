FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/developer-workspace-fe/browser/ ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
