package controllers

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/nats-io/nats.go"
)

var NatsConn *nats.Conn

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func SensorStream(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf(err)
		return
	}
	defer conn.Close()

	var mu sync.Mutex

	tenant := c.Param("tenant")
	subject := "sensors." + tenant + ".>"

	sub, err := NatsConn.Subscribe(subject, func(msg *nats.Msg) {
		mu.Lock()
		defer mu.Unlock()

		err := conn.WriteJSON(gin.H{
			"subject":   msg.Subject,
			"data":      string(msg.Data),
			"timestamp": time.Now().UnixMilli(),
		})
		if err != nil {
			log.Printf(err)
		}
		//log.Printf(err)
	})
	if err != nil {
		return
	}
	defer sub.Unsubscribe()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			log.Printf("Client WS disconnesso: %v", err)
			break
		}
	}
}
