package main

import (
	"flag"
	"fmt"
	"sync"
)

func main() {

	natsURL := flag.String("nats-url", "localhost:4222", "NATS server URL")

	flag.Parse()

	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		wg.Add(1)
		consumerId := fmt.Sprintf("C%d", i+1)
		go InitSubscriber(*natsURL, consumerId, &wg)
	}

	wg.Wait()
}
