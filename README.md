
# UpOrNot 🌐  
**Monitor and analyze server uptime and health in real-time.**  

UpOrNot is a "lightweight" server monitoring tool built in Go that keeps track of the health of your servers by regularly pinging them, recording response times, and calculating uptime percentages. It includes a web interface to view server statuses and a RESTful API to integrate monitoring data into your own applications.

---

## Features ✨
- **Real-Time Monitoring**: Continuously checks server availability using ICMP ping.
- **Detailed Metrics**: Tracks response times, uptime percentages, and the number of successful checks.
- **Web Interface**: Serve a static web page to visualize server statuses easily.
- **RESTful API**: Access server health data programmatically via JSON.
- **Concurrency**: Efficiently monitors multiple servers using a thread-safe approach.
- **Configurable**: Read server configurations from a YAML file for easy setup and modification.

---

## How It Works 🚀
1. **Server Monitoring**: UpOrNot uses ICMP pings to determine server status and response times.
2. **Data Storage**: Metrics like uptime and checks are dynamically updated in memory.
3. **Web/API Access**: 
   - A web interface (`static/index.html`) is served to view server health.
   - An API endpoint (`/api/status`) provides server details in JSON format.
4. **Configurable Servers**: Define servers to monitor in a `service-list.yaml` file.

---

## Installation and Setup 🛠️
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/UpOrNot.git
   cd UpOrNot
   ```
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Create a `service-list.yaml` file in the root directory:
   ```yaml
   servers:
     - name: Google
       host: google.com
     - name: GitHub
       host: github.com
   ```
4. Run the server:
   ```bash
   go run main.go
   ```
5. Open your browser and visit `http://localhost:8080` to view the dashboard.

---

## Running with Docker 🐳

To run **UpOrNot** using Docker, use the provided `docker-compose.yml` file.

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```
2. Open your browser and visit `http://localhost:8080` to view the dashboard.

---

## API Usage 🌐
**Endpoint**: `/api/status`  
**Method**: `GET`  
**Response**: JSON containing server statuses, uptime, and response times.  

Example:
```json
[
  {
    "name": "Google",
    "host": "google.com",
    "status": true,
    "lastChecked": "2025-01-26T12:30:00Z",
    "responseTime": 23,
    "uptime": 99.9,
    "checks": 100,
    "successes": 99
  },
  {
    "name": "GitHub",
    "host": "github.com",
    "status": false,
    "lastChecked": "2025-01-26T12:29:58Z",
    "responseTime": 0,
    "uptime": 95.4,
    "checks": 100,
    "successes": 95
  }
]
```

---

## Contributing 🤝
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request!

---

## Future Enhancements 🛠️
- Add TLS/SSL support for more secure API interactions.
- Improve the web interface with dynamic charts and graphs.
- Support other protocols like HTTP, TCP, and UDP for monitoring.
- Add persistent storage for metrics using a database.
- Add notifications for server downtime via email, SMS, or Slack.

---

## License 📄
This project is licensed under the [MIT License](LICENSE).  

Feel free to clone, modify, and use it in your projects!

---
