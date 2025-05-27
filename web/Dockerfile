FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY . .
CMD ["sh", "-c", "yarn install --frozen-lockfile ; yarn dev"]