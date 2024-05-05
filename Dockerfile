# Base image
FROM node:lts-bookworm-slim

# Create app directory
WORKDIR /usr/app

#Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn run build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["yarn", "run", "start:prod"]
