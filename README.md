# GoBarber
<p>vou editar essa parte posteriormente</p> 



### **1. Bancos utilizados**

postgres, banco relacional 
para criar no docker
docker run --name postgresbarber -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
para iniciar no docker
docker start postgresbarber

mongodb, banco nao relacional 
para criar no docker
docker run --name mongobarber -p 27017:27017 -d -t mongo
para iniciar no docker
docker start mongobarber

redis banco chave e valor
para criar no docker
docker run --name redisbarber -p 6379:6379 -d -t redis:alpine
para iniciar no docker
docker start redisbarber


para rodar o servidor da api e yarn dev
e para rodar a iila de job para resposta de email e yarn queue



para subir o db 
yarn sequelize db:migrate


yarn sequelize db:migrate:undo desfaz a ultima migration 
yarn sequelize db:migrate:undo:all desfaz todas as migrations 
