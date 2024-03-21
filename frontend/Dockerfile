# Use a smaller base image for production
FROM node:alpine as builder
ARG VITE_API_URL
WORKDIR /frontend
COPY . .
RUN npm install
RUN npm run build

# Use a smaller image without npm and node for serving the static files
FROM node:alpine

WORKDIR /frontend
COPY --from=builder /frontend/dist /frontend/dist

# Install a lightweight server
RUN npm install -g serve

# Set the port to the one used by Vite (5173)
ENV PORT=5173
EXPOSE 5173

CMD ["serve", "-p", "5173", "-s", "dist"]
