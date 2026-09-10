FROM node:20-alpine
WORKDIR /app
COPY . .
# Sử dụng .env.docker làm default (chứa DATABASE_URL đúng cho docker-compose)
RUN cp .env.docker .env
RUN npm ci && npx prisma generate && npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
