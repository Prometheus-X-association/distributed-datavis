# ------------------------------------------------------------------
# STAGE 1 : Build the app
# ------------------------------------------------------------------

FROM node:25-alpine AS build

# Set working directory
WORKDIR /app/

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY src ./src
COPY test ./test
COPY __tests__ ./__tests__
COPY __mocks__ ./__mocks__
COPY webpack.config.cjs jest.config.cjs /app/


RUN npm run build


# ------------------------------------------------------------------
# STAGE 2 : Serve the app
# ------------------------------------------------------------------

FROM nginxinc/nginx-unprivileged:stable-alpine AS production
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ /usr/share/nginx/ddv/
COPY --from=build /app/test/ /usr/share/nginx/ddv/test/

# Explicit non-root user (uid 101 is the image's nginx user)
USER 101

EXPOSE 8080
 
# Container health: checks the /health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1