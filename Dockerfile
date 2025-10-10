# stage build
FROM golang:1.25.0-alpine3.22

RUN mkdir /app

WORKDIR /app

COPY ./server ./server

WORKDIR /app/server

RUN go mod download

RUN CGO_ENABLED=1 go build -o server

RUN ls

# stage run
FROM alpine:3.22

WORKDIR /app

COPY --from=0 /app/server /app

EXPOSE 27945

CMD ["/app/server"]
