# stage build
FROM golang:1.25 AS build

WORKDIR /app
COPY . .

RUN go mod download
RUN CGO_ENABLED=1 go build -o /app/serverbin

# stage run
FROM golang:1.25

WORKDIR /
COPY --from=build /app/serverbin /serverbin
COPY --from=build /app/migrations /migrations

EXPOSE 27945

ENTRYPOINT ["/serverbin"]
