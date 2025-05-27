# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --force

# Copy the source code
COPY . .

# Copy environment file based on build argument
ARG ENV_FILE
COPY $ENV_FILE .env

# Build the app for production
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:18-alpine AS serve

# Set working directory
WORKDIR /app

# Install a lightweight HTTP server
RUN npm install -g serve

# Copy the built app from the previous stage
COPY --from=build /app/dist /app/dist

# Expose port 3000
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]