# Use official Node.js 18 LTS slim image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies based on package-lock / package.json
COPY package*.json ./

# Install production dependencies only for smaller image
RUN npm ci --only=production --no-audit --no-fund || npm install --production --no-audit --no-fund

# Copy app source
COPY . .

# Default environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port the app runs on
EXPOSE ${PORT}

# Start the app
CMD ["node", "src/index.js"]
