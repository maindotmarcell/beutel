.PHONY: build run test test-race test-cover fmt vet lint clean

# Build the server binary
build:
	go build -o bin/server ./cmd/server

# Run the server (testnet4 by default)
run:
	NETWORK=testnet4 go run ./cmd/server

# Run all tests (no race detector — fast)
test:
	go test -count=1 -timeout 30s ./...

# Run all tests with the race detector (use before committing)
test-race:
	go test -race -count=1 -timeout 30s ./...

# Run tests with coverage report
test-cover:
	go test -cover -count=1 -timeout 30s ./...

# Format all Go source files
fmt:
	gofmt -w .

# Run go vet (catches common correctness issues)
vet:
	go vet ./...

# Clean build artifacts
clean:
	rm -rf bin/
