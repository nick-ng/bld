#!/bin/bash

cd server

if [ "$1" == "build" ]; then
	PORT=27945 docker compose build
fi

PORT=27945 docker compose up
