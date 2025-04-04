FROM node:22-alpine AS build
WORKDIR /opt/app
ADD *.json ./
RUN npm ci
ADD . .
RUN npm run generate
RUN npm run build

FROM node:22-alpine
WORKDIR /opt/app
ADD package*.json ./
RUN npm ci --omit=dev
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/prisma ./prisma
CMD ["npm", "run", "start:prod"]

EXPOSE 3000