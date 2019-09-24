#!/bin/bash
set -e
docker run -d --name jewish-server -p 3001:3001 --env-file /srv/jewish-server/.env jewish-server