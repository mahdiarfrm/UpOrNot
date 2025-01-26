package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/go-ping/ping"
	viper "github.com/spf13/viper"
)

type Server struct {
	Name         string    `yaml:"name" json:"name"`
	Host         string    `yaml:"host" json:"host"`
	Status       bool      `json:"status"`
	LastChecked  time.Time `json:"lastChecked"`
	ResponseTime int64     `json:"responseTime"`
	Uptime       float64   `json:"uptime"`
	Checks       int64     `json:"checks"`
	Successes    int64     `json:"successes"`
}

type ServerList struct {
	Servers []Server
	mutex   sync.RWMutex
}

func NewServerList() *ServerList {
	return &ServerList{}
}

func (sl *ServerList) UpdateServerStatus(index int, status bool, responseTime int64) {
	sl.mutex.Lock()
	defer sl.mutex.Unlock()

	sl.Servers[index].Status = status
	sl.Servers[index].LastChecked = time.Now()
	sl.Servers[index].ResponseTime = responseTime
	sl.Servers[index].Checks++
	if status {
		sl.Servers[index].Successes++
	}
	sl.Servers[index].Uptime = float64(sl.Servers[index].Successes) / float64(sl.Servers[index].Checks) * 100
}

func (sl *ServerList) GetServers() []Server {
	sl.mutex.RLock()
	defer sl.mutex.RUnlock()
	return sl.Servers
}

func pingServer(server *Server) (bool, int64) {
	pinger, err := ping.NewPinger(server.Host)
	if err != nil {
		log.Printf("Error creating pinger for %s: %v", server.Name, err)
		return false, 0
	}

	pinger.Count = 1
	pinger.Interval = time.Second
	pinger.Timeout = time.Second
	start := time.Now()
	err = pinger.Run()
	if err != nil {
		log.Printf("Error pinging %s: %v", server.Name, err)
		return false, 0
	}

	responseTime := time.Since(start).Milliseconds()
	return pinger.Statistics().PacketsRecv > 0, responseTime
}

var sl *ServerList

func monitorServers(sl *ServerList) {
	for {
		for i := range sl.Servers {
			status, responseTime := pingServer(&sl.Servers[i])
			sl.UpdateServerStatus(i, status, responseTime)
			if status {
				log.Printf("'%v' Host is Up! Response time: %dms", sl.Servers[i].Name, responseTime)
			} else {
				log.Printf("'%v' Host is Down!", sl.Servers[i].Name)
			}
		}
		time.Sleep(10 * time.Second)
	}
}

func serveHTML(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/index.html")
}

func handleAPIStatus(sl *ServerList, w http.ResponseWriter, r *http.Request) {
	// add "CORS" headers later
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sl.mutex.RLock()
	servers := sl.Servers
	sl.mutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(servers)
}

func main() {
	sl = NewServerList()

	viper.SetConfigName("server-list")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Fatal error config file: %v", err)
	}

	if err := viper.UnmarshalKey("servers", &sl.Servers); err != nil {
		log.Fatalf("Error unmarshaling config: %v", err)
	}

	go monitorServers(sl)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/", serveHTML)
	http.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		handleAPIStatus(sl, w, r)
	})

	log.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
