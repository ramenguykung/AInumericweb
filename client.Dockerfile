# Build stage
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Build the app
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]