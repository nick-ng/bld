# stage build
FROM golang:1.25 AS build

WORKDIR /app
COPY . .

RUN go mod download
RUN CGO_ENABLED=1 go build -o /app/serverbin

# stage run
FROM gcr.io/distroless/static-debian12

WORKDIR /
COPY --from=build /app/serverbin /

EXPOSE 27945

ENTRYPOINT ["/serverbin"]
