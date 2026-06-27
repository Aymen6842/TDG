# Use the Node.js LTS image
FROM node:22.15.0

RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm@11.3.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npm list @prisma/client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Create a folder for logs and erros
RUN mkdir logs

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
