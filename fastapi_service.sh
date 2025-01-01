#!/bin/bash

APP="uvicorn main:app --host 192.168.1.48 --port 8001"
PID_FILE="fastapi_service.pid"

start() {
    if [ -f $PID_FILE ]; then
        echo "Service is already running. Stop it first."
    else
        echo "Starting FastAPI service..."
        nohup $APP > fastapi_service.log 2>&1 & echo $! > $PID_FILE
        echo "Service started with PID $(cat $PID_FILE)"
    fi
}

stop() {
    if [ -f $PID_FILE ]; then
        echo "Stopping FastAPI service..."
        kill $(cat $PID_FILE) && rm -f $PID_FILE
        echo "Service stopped."
    else
        echo "Service is not running."
    fi
}

restart() {
    echo "Restarting FastAPI service..."
    stop
    start
}

status() {
    if [ -f $PID_FILE ]; then
        echo "Service is running with PID $(cat $PID_FILE)"
    else
        echo "Service is not running."
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
esac