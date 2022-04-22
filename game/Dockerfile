FROM node:lts-slim as builder
WORKDIR /dfs_game
COPY . ./
RUN npm install --silent
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /dfs_game/build/ /usr/share/nginx/html
COPY ./etc/nginx/conf.d/default.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

