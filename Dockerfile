# Production Stage
FROM node:20-slim
WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets from local dist
COPY dist ./dist

# Copy backend server
COPY server.js ./

# Clean up
RUN rm -rf package*.json

EXPOSE 8080
CMD ["node", "server.js"]
