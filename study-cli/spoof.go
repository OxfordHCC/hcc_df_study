package main

import (
	"errors"
	"os"
	"strings"

	flag "github.com/spf13/pflag"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)


func spoofTextCmd(client MurmurRPC.V1Client, args []string)(error, string){
	flagSet := flag.NewFlagSet("text", flag.ExitOnError);

	fileFlag := flagSet.BoolP("file", "f", false, "use file as input");
	serverId := flagSet.Uint32P("server", "s", 0, "server");
	actorId := flagSet.Uint32P("actor", "a", 0, "the user who sent the message.");

	flagSet.Parse(args);
	
	err, server := getServerById(client, *serverId);
	if err != nil {
		return err, ""
	}
	
	err, actor := getUserById(client, *actorId, server);
	if err != nil {
		return err, ""
	}
	
	var text string;
	if *fileFlag == true {
		filePath := flagSet.Arg(1);
		dat, err := os.ReadFile(filePath)

		if err != nil {
			return err, ""
		}

		text = string(dat);
	}else{
		text = strings.Join(flagSet.Args(), " ");
	}

	murmurTextMsg := MurmurRPC.TextMessage{
		Server: server,
		Actor: actor,
		Text: &text,
	}

	ctx, cancel := getCtx()
	defer cancel()

	_, err = client.TextMessageSend(ctx, &murmurTextMsg)
	
	return err, ""
}

func spoofAudioCmd(client MurmurRPC.V1Client, args []string)(error, string){
	return errors.New("audio spoofing command not implemented yet"), "";
}

func spoofCmd(client MurmurRPC.V1Client, args []string)(error, string){
	commands := make(commandTree);
	commands["text"] = spoofTextCmd;
	commands["audio"] = spoofAudioCmd;

	if len(args) < 2 {
		return errors.New(help(commands)), "";
	}

	cmd := args[0]
	cmdFn, ok := commands[cmd]

	if !ok{
		return errors.New("show help"), ""
	}

	return cmdFn(client, args[1:]);
}
