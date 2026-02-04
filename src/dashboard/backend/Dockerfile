FROM --platform=$BUILDPLATFORM golang:1.25-alpine
RUN apk add --no-cache go

WORKDIR /app/
COPY go.mod go.sum ./
RUN go mod download


# EXPOSE 3000

ENTRYPOINT go run main.go
