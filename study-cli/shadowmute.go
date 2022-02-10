package main

import (
	flag "github.com/spf13/pflag"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)

func shadowmuteCmd(client MurmurRPC.V1Client, args []string)(error, string){
	flagSet := flag.NewFlagSet("shadowmute", flag.ExitOnError);

	serverId := flagSet.Uint32P("server", "s", 0, "server id");
	targetId := flagSet.Uint32P("target", "t", 0, "target user id");
	muteStatus := flagSet.BoolP("mute", "m", true, "mute or unmute");

	flagSet.Parse(args);

	err, server := getServerById(client, *serverId);
	if err != nil {
		return err, "";
	}
	err, target := getUserById(client, *targetId, server);

	shadowmuteMessage := MurmurRPC.ShadowmuteMessage{
		Server: server,
		Target: target,
		MuteStatus: muteStatus,
	}

	ctx, cancel := getCtx();
	defer cancel();
	
	client.Shadowmute(ctx, &shadowmuteMessage);

	return nil, "";
}
