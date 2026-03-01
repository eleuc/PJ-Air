FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar la carpeta dist (compilar NestJS)
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "start:prod"]
