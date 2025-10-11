#!/bin/bash

git checkout -f main
git pull

cd server

PORT=3014 docker compose down
PORT=3014 docker compose build
PORT=3014 docker compose up -d

touch ./volumes/user-data/users.json
