# Robocup Rescue-MapEditor

An online platform to create Rescue Line and Line Entry maps.

## Dependencies

[Node](https://nodejs.org/en/) - used version 16.17.xx

[NPM](https://www.npmjs.com/) - used version 18.15.xx

[Docker](https://www.docker.com/) - to install Database-dump


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) -  version 15.0.xx.

## Installation

```bash
$ npm install
```

## Open Development Site

Navigate to `http://localhost:4401/`. The application will automatically reload if you
change any of the source files.

# Rescue-MapEditor - Backend

## Preperation local Docker Dump

Setup `.env`-file in repo.

```bash
Open in Terminal:

# run to install docker container
$ docker run --name mongodb -d --restart always -p 27017:27017 mongo

# show current running docker container id
$ docker ps

# Copy <ID> and import <Name>.dump
$ docker exec -i <ID> sh -c "mongorestore --archive" < <Name>.dump
```

```bash
Open in Terminal:
$ cd /backend

# start dev server
$ npm start

# start dev server - development
$ npm run start:dev
```


# Rescue-MapEditor - Frontend

## Installation

```bash
$ cd /frontend

$ npm install
```

## Running the app

```bash
# development
$ npm run start

# local
$ npm run start:local

# watch mode
$ npm run start:dev

```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->
