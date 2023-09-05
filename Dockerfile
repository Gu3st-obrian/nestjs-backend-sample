FROM node:16

WORKDIR /app

RUN npm i --location=global @nestjs/cli

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
