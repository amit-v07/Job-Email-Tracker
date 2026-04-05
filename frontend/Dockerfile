FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Expose Vite default dev server port
EXPOSE 3000

# Start Vite with --host to allow external access within Docker network
CMD ["npm", "run", "dev"]
