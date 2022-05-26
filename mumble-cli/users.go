package main

import (
	"fmt"
	"strings"
	"errors"
	
	flag "github.com/spf13/pflag"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)


func getUserById(client MurmurRPC.V1Client, channelId uint32, server *MurmurRPC.Server) (error, *MurmurRPC.User){
	err, users := getUsers(client, server)
	if(err != nil){
		return err, nil
	}

	for _, u := range users{
		if u.GetSession() == channelId{
			return nil, u
		}
	}

	return errors.New("user not found"), nil
}

func getUserByName(client MurmurRPC.V1Client, username string, server *MurmurRPC.Server)(error, *MurmurRPC.User){
	err, users := getUsers(client, server)
	if(err != nil){
		return err, nil
	}

	for _, u := range users{
		if u.GetName() == username {
			return nil, u
		}
	}

	return errors.New("user not found"), nil
}


func getUsers(client MurmurRPC.V1Client, server *MurmurRPC.Server) (error, []*MurmurRPC.User){
	ctx, cancel := getCtx()
	defer cancel()

	query := MurmurRPC.User_Query{
		Server: server,
	}
	
	users, err := client.UserQuery(ctx, &query)
	
	if err != nil{
		return err, nil
	}
	
	return nil, users.Users
}

func usersCmd(client MurmurRPC.V1Client, args []string) (error, string){
	name := "users"
	flagSet := flag.NewFlagSet(name, flag.ExitOnError);
	
	positionalArguments := []PosArg {{
		name: "server-id",
		optional: false,
		vararg: false,
	}}

	flagSet.Usage = UsageWithArgs(name, *flagSet, positionalArguments);
	
	flagSet.Parse(args);

	err, serverId := parseUint32(flagSet.Arg(0));
	err, server := getServerById(client, serverId);

	if(err != nil){
		return err, "";
	}

	err, users := getUsers(client, server)
	var sb strings.Builder

	for _, u := range users{
		sb.WriteString(fmt.Sprintf("%d - %s\n", u.GetSession(), u.GetName()))
	}

	return nil, sb.String()
}
