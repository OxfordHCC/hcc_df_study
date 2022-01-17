package main

import (
	"fmt"
	"strings"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)


func serversCmd(client MurmurRPC.V1Client, args []string) (error, string){
	err, serverList := getServerList(client)

	var sb strings.Builder
	
	for _, srv := range serverList {
		sb.WriteString(fmt.Sprintf("%s\n", srv.String()))
	}

	return err, sb.String()
}
