#! /bin/sh

protoc \
	--go-grpc_out=. --go-grpc_opt=paths=source_relative \
	--go_out=. --go_opt=paths=source_relative \
	grpc/MurmurRPC.proto

