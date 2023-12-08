# Use the official Node.js image based on Alpine Linux
FROM node:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app/

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your application will run on
EXPOSE 4555

# Command to run the application
CMD ["node", "index.js"]
