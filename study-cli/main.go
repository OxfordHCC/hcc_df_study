package main

import (
	//	"bufio"

	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"google.golang.org/grpc"
	"hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)

/*
   This program takes the form of a REPL with various implemented commands.
   See the command implementation functions for what arguments are accepted etc.

*/

func parseUint32(arg string) (error, uint32){
	val64, err := strconv.ParseUint(arg, 10, 32)
	if(err != nil){
		return err, 0
	}

	val32 := uint32(val64)
	return nil, val32
}


func getServerList(client MurmurRPC.V1Client) (error, []*MurmurRPC.Server) {
	ctx, cancel := getCtx()
	defer cancel()

	query := MurmurRPC.Server_Query{}
	serverList, err := client.ServerQuery(ctx, &query)

	return err, serverList.Servers
}

func getServerById(client MurmurRPC.V1Client, serverId uint32) (error, *MurmurRPC.Server){
	err, serverList := getServerList(client)
	if(err != nil){
		return err, nil
	}

	for _, srv := range serverList {
		if srv.GetId() == serverId{
			return nil, srv
		}
	}

	return errors.New("server not found"), nil
}

func getChannels(client MurmurRPC.V1Client, server *MurmurRPC.Server) (error, []*MurmurRPC.Channel) {
	ctx, cancel := getCtx()
	defer cancel()

	query := MurmurRPC.Channel_Query{
		Server: server,
	}
	
	channels, err := client.ChannelQuery(ctx, &query)
	
	return err, channels.Channels
}

type commandTree = map[string]func(a MurmurRPC.V1Client, b []string)(error, string);

func help(commands commandTree) string{
	var sb strings.Builder;

	sb.WriteString(fmt.Sprintf("Subcommands:\n"));

	for k := range commands {
		sb.WriteString(fmt.Sprintf(" %s \n", k));
	}
	
	return sb.String();
}

func main(){
	commands := make(commandTree);
	//	commands["shell"] = shellCmd;
	commands["send"] = sendCmd; // send audio to someone
	commands["users"] = usersCmd; // get users 
	commands["servers"] = serversCmd; // get servers
	//commands["spoof"] = spoofCmd; // spoof audio/text message

	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, help(commands))
		return
	}
	
	cmd := os.Args[1];
	cmdFn, ok := commands[cmd];

	conn, err := grpc.Dial(
		"127.0.0.1:50051",
		grpc.WithInsecure(),
		grpc.WithBlock(),
		grpc.FailOnNonTempDialError(true),
	)

	defer conn.Close()
	client := MurmurRPC.NewV1Client(conn)
	
	if err != nil {
		panic(err)
	}

	if !ok {
		panic("show help")
	}

	err, res := cmdFn(client, os.Args[2:]);
	if err != nil{
		fmt.Fprintln(os.Stderr, err);
		return
	}

	fmt.Println(res);
	return
}
