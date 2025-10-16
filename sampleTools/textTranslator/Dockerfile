FROM node:20-slim
WORKDIR /
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]