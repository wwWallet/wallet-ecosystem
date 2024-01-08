docker build -t did-resolver-service .
docker run -p 4555:4555 -d did-resolver-service