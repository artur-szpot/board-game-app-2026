@echo off
setlocal
cd /d "%~dp0"
docker compose -f compose.watch.yaml up --build %*