# ==== CONFIGURE =====
# Use a Node 16 base image
FROM node:16-alpine

# Set the working directory to /app inside the container
WORKDIR /app

# Copy only the `frontend` directory's content to the container's /app directory
COPY ./frontend/package*.json ./  # Copy package.json and package-lock.json from frontend
COPY ./frontend/ .  # Copy the rest of the frontend files (public, src, etc.)

# Install dependencies (npm ci makes sure the exact versions in the lockfile are installed)
RUN npm ci

# Build the app
RUN npm run build

# ==== RUN =======
# Set the env to "production"
ENV NODE_ENV production

# Expose the port on which the app will be running (3000 is the default for `serve`)
EXPOSE 3000

# Start the app
CMD ["npx", "serve", "build"]



# # ==== CONFIGURE =====
# # Use a Node 16 base image
# FROM node:16-alpine 

# # Set the working directory to /app inside the container
# WORKDIR /app

# # Copy the package.json and package-lock.json before installing dependencies
# COPY package*.json ./

# # ==== BUILD =====
# # Install dependencies (npm ci makes sure the exact versions in the lockfile get installed)
# RUN npm ci 

# # Copy all the other application files
# COPY . .

# # Build the app
# RUN npm run build

# # ==== RUN =======
# # Set the env to "production"
# ENV NODE_ENV production

# # Expose the port on which the app will be running (3000 is the default that `serve` uses)
# EXPOSE 3000

# # Start the app
# CMD [ "npx", "serve", "build" ]
