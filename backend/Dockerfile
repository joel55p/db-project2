FROM node:20-alpine

WORKDIR /app

#  se instalan dependencias primero (cache de Docker)
COPY package.json ./
RUN npm install --omit=dev

# ahora se copia el resto del code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
