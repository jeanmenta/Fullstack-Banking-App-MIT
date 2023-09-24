FROM node:20.6.1
ENV PORT 3000

# Create app directory
RUN mkdir -p /usr/src app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Building app
RUN npm run build

# Expose port
EXPOSE 3000

# Running the app
CMD "npm" "run" "start"