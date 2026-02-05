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
		tenantId := fmt.Sprintf("tenant_%d", i+1)
		gatewayId := fmt.Sprintf("gateway%d", i+1)

		go gateway.Init(*natsURL, tenantId, gatewayId, &wg)
	}

	wg.Wait()
}
