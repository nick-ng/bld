# stage build
FROM golang:1.25 AS build

WORKDIR /app
COPY . .

RUN go mod download
RUN CGO_ENABLED=1 go build -o /app/serverbin

# @todo(nick-ng): figure out how to use a distroless image
# https://github.com/GoogleContainerTools/distroless/blob/dca9008b864a381b5ce97196a4d8399ac3c2fa65/base/README.md
# stage run
FROM golang:1.25

WORKDIR /
COPY --from=build /app/serverbin /serverbin
COPY --from=build /app/migrations /migrations

EXPOSE 27945

ENTRYPOINT ["/serverbin"]
