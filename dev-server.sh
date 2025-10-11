#!/bin/bash

cd server

PORT=27945 docker compose build && PORT=27945 docker compose up
