FROM --platform=$BUILDPLATFORM golang:1.25-alpine
RUN apk add go

WORKDIR /app/
COPY go.mod go.sum ./
COPY . .
RUN go mod download


# EXPOSE 3000
EXPOSE 3001
ENTRYPOINT ["go", "run", "."]
