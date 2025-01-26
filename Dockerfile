FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o upornot

FROM alpine:3.14
RUN apk add --no-cache ca-certificates tzdata
RUN adduser -D -g '' appuser
WORKDIR /app
COPY --from=builder /app/upornot .
COPY static/ static/
COPY server-list.yaml .
USER appuser

EXPOSE 8080
CMD ["./upornot"]
