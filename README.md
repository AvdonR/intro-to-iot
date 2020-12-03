# Introduction to IoT Project - IoT Smart Lock System

## Node.js API using Express, TypeScript, Vue, PostgreSQL, and MQTT
This project utilizes a wide range of technologies to implement an IoT Smart Lock system. The front-end web interface utilizes a custom API that interacts with a PostgreSQL database and a MQTT message broker service. A third-party authentication service (API) is also used to handle user login and manage different lock states per user.

## Requirements

* Install [Node.js](https://nodejs.org) version 8+
* Install [Docker](https://www.docker.com/) (or create and use another instance of [PostgreSQL](https://www.postgresql.org/) if you prefer not to use Docker)

## Development Environment Setup

* Clone or download this repository
* Install modules using `npm install`
* Set up [PostgreSQL with Docker](https://docs.docker.com/samples/library/postgres/). Once Docker is installed, create a new PostgreSQL database using the following commands. If a different database name and password is chosen here, you must also update the `.env` file to relfect this change.

```bash
docker pull postgres
docker run -d --name locks-db -p 5432:5432 -e 'POSTGRES_PASSWORD=passw0rd' postgres
```

* Initialize the PostgreSQL database by running `npm run initdb`

## Launching the Application

To run the application in development mode:

```bash
npm run dev
```

By default, the web application should now be running at [http://localhost:8080](http://localhost:8080).

## Links to Technologies Used

* [Node.js](https://nodejs.org)
* [TypeScript](https://www.typescriptlang.org/)
* [Express](https://expressjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [EJS](https://github.com/mde/ejs)
* [Okta's Node.js OIDC Middleware](https://www.npmjs.com/package/@okta/oidc-middleware)
* [Vue](https://vuejs.org/)
* [Materialize](https://materializecss.com/)
* [Axios](https://github.com/axios/axios)
