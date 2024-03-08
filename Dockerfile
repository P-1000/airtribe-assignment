FROM node:14

WORKDIR /app

COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3000


ENV PGHOST=postgres
ENV PGUSER=postgres
ENV PGPASSWORD=your_password
ENV PGDATABASE=your_database

CMD ["npm", "start"]