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

let isPolling = true;
let pollInterval = 5000; // 5sec
let retryAttempts = 0;
const maxRetryAttempts = 5;
const baseRetryDelay = 5000;

async function fetchServerStatus() {
    try {
        const response = await fetch('/api/status');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const servers = await response.json();
        updateServerList(servers);
        
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        serverList.style.display = 'block';
        retryAttempts = 0;
        
        if (isPolling) {
            setTimeout(fetchServerStatus, pollInterval);
        }
    } catch (error) {
        console.error('Error fetching server status:', error);
        handleError();
    }
}

function handleError() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    serverList.style.display = 'none';

    if (retryAttempts < maxRetryAttempts) {
        const delay = Math.min(baseRetryDelay * Math.pow(2, retryAttempts), 30000);
        console.log(`Connection failed. Retrying in ${delay/1000} seconds... (Attempt ${retryAttempts + 1}/${maxRetryAttempts})`);
        retryAttempts++;
        setTimeout(fetchServerStatus, delay);
    } else {
        console.error('Max retry attempts reached. Please refresh the page.');
        errorElement.textContent = 'Connection lost. Please refresh the page to try again.';
        isPolling = false;
    }
}

fetchServerStatus();

window.addEventListener('beforeunload', () => {
    isPolling = false;
});
