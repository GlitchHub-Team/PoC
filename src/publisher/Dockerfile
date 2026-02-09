FROM golang:1.24.3-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o publisher main.go

CMD ["./publisher", "--nats-url", "glitchhubteam.it:4222"]