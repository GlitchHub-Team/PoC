FROM --platform=$BUILDPLATFORM golang:1.25-alpine
RUN apk add go

WORKDIR /app/pub/
COPY go.mod go.sum ./
COPY . .
# RUN go mod download

# EXPOSE 4222
ENTRYPOINT ["go", "run", "."]
