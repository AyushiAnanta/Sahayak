# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json first (this helps with caching)
COPY package*.json ./

# Install the backend dependencies
RUN npm install

# Copy all your backend code into the container
COPY . .

# Expose the port your Express server runs on (change if yours isn't 5000)
EXPOSE 5000

# The command to start your backend
CMD ["npm", "run", "dev"]