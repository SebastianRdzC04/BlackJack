# Etapa 1: Build de la aplicación Angular
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Imagen final con Nginx
FROM nginx:stable-alpine
# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
# Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy Angular build files (modificando la ruta para usar los archivos de la carpeta browser)
COPY --from=builder /app/dist/front-end/browser /usr/share/nginx/html
# Verify the index.html exists in the build directory
RUN ls -la /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]