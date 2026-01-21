# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create the Files directory needed for file operations
RUN mkdir -p src/Files

# Expose the port your app runs on (assuming a common Node.js port)
EXPOSE 5000

# Command to run the application
CMD ["node", "src/server.js"]
