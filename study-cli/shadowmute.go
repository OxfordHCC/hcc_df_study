package main

import (
	flag "github.com/spf13/pflag"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)

func shadowmuteCmd(client MurmurRPC.V1Client, args []string)(error, string){
	flagSet := flag.NewFlagSet("shadowmute", flag.ExitOnError);

	serverId := flagSet.Uint32P("server", "s", 0, "server id");
	targetName := flagSet.StringP("target", "t", "", "target user name");
	unmute := flagSet.BoolP("unmute", "u", false, "mute or unmute");

	flagSet.Parse(args);

	muteStatus := !(*unmute);

	err, server := getServerById(client, *serverId);
	if err != nil {
		return err, "";
	}
	err, target := getUserByName(client, *targetName, server);

	shadowmuteMessage := MurmurRPC.ShadowmuteMessage{
		Server: server,
		Target: target,
		MuteStatus: &muteStatus,
	}

	ctx, cancel := getCtx();
	defer cancel();
	
	client.Shadowmute(ctx, &shadowmuteMessage);

	return nil, "";
}
