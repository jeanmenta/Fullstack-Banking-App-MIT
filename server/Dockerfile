# Use Node.js image
FROM node:20.6.1

# Create app directory
WORKDIR /usr/src/app
RUN rm -rf ./node_modules

# Installing dependencies
COPY package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source 

# Bundle app source
COPY . .

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
