# Use Node 20 alpine for lightweight build
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
