# API de liga de tenis Whynot

El backend esta construido con NodeJs, Express, MongoDB y Typescript. Usamos tecnologias como Docker para hacer el despliegue hacia Docker Hub y asi poder llevarnos el contenedor directamente en nuestra instancia EC2 de AWS.


## Instalación y uso
Teniendo en cuenta que ya has clonado el repositorio, sigue los pasos para poder hacer uso de nuestra api.

    npm install
    npm run dev
Si quieres hacer un despliegue a tu repositorio de docker hub ejecuta el siguiente comando. Tener en cuenta que en el docker compose debes configurar segun tu repositorio y ademas, tener instalado y corriendo Docker en tu computadora.

    docker-compose build
    docker-compose push

IMPORTANTE:
Para poder hacer uso del autenticador de usuario y generar una nueva contraseña, debes ingresar y mandar el mensaje al WhtsApp Sandbox de Twilio.
[SANDBOX DE TWILIO](https://api.whatsapp.com/send/?phone=%2b14155238886&text=join%20either-younger&type=phone_number&app_absent=0)

## Documentación de los endpoints
Aqui podras ver la forma en como se manejan todas las peticiones de manera detallada.
https://documenter.getpostman.com/view/19761247/2s9Ye8faZG
