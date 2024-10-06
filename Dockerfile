# stage build
FROM golang:1.23.2-alpine3.20

RUN mkdir /app

WORKDIR /app

COPY ./server ./server

WORKDIR /app/server

RUN go mod download

RUN go build -o server

RUN ls

# stage run
FROM alpine:3.20

WORKDIR /app

COPY --from=0 /app/server /app

EXPOSE 27945

CMD ["/app/server"]
