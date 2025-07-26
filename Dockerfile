FROM node:22.17.1

WORKDIR /server
COPY . .

RUN npm install -g pnpm@9.15.9
RUN pnpm install

EXPOSE 3000

CMD ["node", "index.js"]

