# Use a lightweight version of Node.js
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of your React code
COPY . .

# Expose the port React uses (usually 3000 for standard React, or 5173 for Vite)
EXPOSE 3000

# The command to start your React app
CMD ["npm", "run", "dev"]