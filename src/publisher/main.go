package main

import (
	"flag"
	"fmt"
	"gateway/gateway"
	"sync"
)

func main() {

	natsURL := flag.String("nats-url", "localhost:4222", "NATS server URL")

	flag.Parse()

	var wg sync.WaitGroup

	for i := 0; i < 2; i++ {
		wg.Add(1)
		tenantID := fmt.Sprintf("tenant_%d", i+1)
		serialNumberGateway := fmt.Sprintf("SN%d", i+1)
		go gateway.Init(*natsURL, tenantID, serialNumberGateway, &wg)
	}

	wg.Wait()
}
