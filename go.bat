@echo off
setlocal
cd /d "%~dp0"
docker compose -f compose.yaml up --build %*
if errorlevel 1 (
	echo.
	echo Compose startup failed.
	echo.
	echo If this happened right after DB initialization, the cycle-trigger integration gate may have failed.
	echo Inspect it with:
	echo   docker compose -f compose.yaml logs db-cycle-tests
	echo.
	echo If needed, rerun only that gate:
	echo   docker compose -f compose.yaml run --rm db-cycle-tests
	exit /b 1
)