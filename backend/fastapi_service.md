To run your **FastAPI** application as a service on macOS with support for **start**, **stop**, and **restart** actions via a `.sh` script, follow these steps:

---

### 1. Create a Shell Script
Create a script named `fastapi_service.sh` with the following content:

```bash
#!/bin/bash

APP="uvicorn main:app --host 0.0.0.0 --port 8001"
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
```

---

### 2. Make the Script Executable
```bash
chmod +x fastapi_service.sh
```

---

### 3. Use the Script
Run the script with the desired action:

- **Start the Service**:
  ```bash
  ./fastapi_service.sh start
  ```

- **Stop the Service**:
  ```bash
  ./fastapi_service.sh stop
  ```

- **Restart the Service**:
  ```bash
  ./fastapi_service.sh restart
  ```

- **Check Service Status**:
  ```bash
  ./fastapi_service.sh status
  ```

---

### 4. Logs
The script will log the service output to `fastapi_service.log`. You can view the log with:
```bash
tail -f fastapi_service.log
```

---

### 5. Automate Startup (Optional)
To make the service run on system startup:
1. Create a `.plist` file in `~/Library/LaunchAgents/` for the script.
2. Or, add the script to your shell startup file (e.g., `.zshrc` or `.bashrc`).