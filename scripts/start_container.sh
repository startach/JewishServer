#!/bin/bash
set -e
docker run -d --name jewish-server -p 80:3001 --env-file /srv/jewish-server/.env jewish-server