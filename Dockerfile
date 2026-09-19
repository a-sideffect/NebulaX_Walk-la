# Use the official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Expose the ports your app uses (Vite on 3000, Server on 8787)
EXPOSE 3000
EXPOSE 8787

# Start the app using your concurrent script
CMD ["npm", "run", "dev:all"]
