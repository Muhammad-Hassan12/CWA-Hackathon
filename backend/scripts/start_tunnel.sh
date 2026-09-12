#!/bin/bash
exec /tmp/cloudflared tunnel --no-autoupdate --url http://localhost:8008
