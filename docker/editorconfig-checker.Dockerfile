FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set the correct real version
ENV ECC_VERSION=2.6.0

# Download the real Linux binary
RUN curl -sSL "https://github.com/editorconfig-checker/editorconfig-checker/releases/download/${ECC_VERSION}/ec-linux-amd64" -o /usr/local/bin/editorconfig-checker \
	&& chmod +x /usr/local/bin/editorconfig-checker

WORKDIR /app
