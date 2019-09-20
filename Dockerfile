FROM risingstack/alpine:3.4-v6.9.4-4.2.0

ENV PORT 3001
ENV NPM_CONFIG_PRODUCTION=false

EXPOSE 3001

COPY package.json package.json
RUN npm install

COPY . .
RUN npm run build

RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.7/main/ nodejs=8.9.3-r1 && apk add nodejs

CMD ["node", "dist/"]
