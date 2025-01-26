const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const serverList = document.getElementById('serverList');

function updateServerList(servers) {
    serverList.innerHTML = servers.map(function(server) {
        return '<div class="server-item">'
            + '<div class="status-dot ' + (server.status ? 'status-up' : 'status-down') + '"></div>'
            + '<div class="server-info">'
                + '<div class="server-name">' + server.name + '</div>'
                + '<div class="server-host">' + server.host + '</div>'
            + '</div>'
            + '<div class="server-stats">'
                + '<div>Response: <span class="response-time">' + (server.status ? server.responseTime + 'ms' : 'N/A') + '</span></div>'
                + '<div>Uptime: <span class="uptime">' + server.uptime.toFixed(1) + '%</span></div>'
                + '<div>Last checked: ' + new Date(server.lastChecked).toLocaleTimeString() + '</div>'
            + '</div>'
        + '</div>';
    }).join('');
}

let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 5000;

function connectWebSocket() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    serverList.style.display = 'none';

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const ws = new WebSocket(protocol + window.location.host + '/ws');
    let reconnectTimeout;

    ws.onopen = function() {
        console.log('WebSocket connection established');
        loadingElement.style.display = 'none';
        serverList.style.display = 'block';
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    ws.onmessage = function(event) {
        try {
            const servers = JSON.parse(event.data);
            updateServerList(servers);
        } catch (error) {
            console.error('Error parsing server data:', error);
        }
    };

    ws.onclose = function() {
        clearTimeout(reconnectTimeout);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        serverList.style.display = 'none';

        if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
            console.log(`WebSocket connection closed. Retrying in ${delay/1000} seconds... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            reconnectTimeout = setTimeout(connectWebSocket, delay);
            reconnectAttempts++;
        } else {
            console.error('Max reconnection attempts reached. Please refresh the page.');
            errorElement.textContent = 'Connection lost. Please refresh the page to try again.';
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        serverList.style.display = 'none';
    };
}

connectWebSocket();