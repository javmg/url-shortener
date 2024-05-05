# url-shortener

## Build

The software needs NodeJS and YARN.

The first step would be to install the dependencies:

```
yarn install
```

Then we can build as follows:

```
yarn run build
```

## Testing

We can run the tests as follows:

```
yarn test
```

## Execution

Create a .env file in the root folder following the .env.example file.

To start the api application just run:

## Local

```
yarn run start:dev
```

The Swagger UI should be available under:

http://localhost:3000/

## Docker

First we build the docker image:

```
docker build -t url-shortener .
```

Then we can run it as follows:

```
docker run --name url-shortener -p 3000:3000 --env-file .env url-shortener
```

The Swagger UI should be available under:

http://localhost:3000/
