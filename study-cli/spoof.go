package main

import (
	"os"
	"strings"
	"encoding/hex"

	flag "github.com/spf13/pflag"
	MurmurRPC "hcc.ox.ac.uk/dfstudy/mumble-cli/grpc"
)


func spoofCmd(client MurmurRPC.V1Client, args []string)(error, string){
	flagSet := flag.NewFlagSet("spoof", flag.ExitOnError);

	bitrate := flagSet.Uint32P("bitrate", "b", 32000, "bitrate");
	sampleRate := flagSet.Uint32P("sample-rate", "r", 48000, "sample rate");
	frameSize := flagSet.Uint32P("frame-size", "p", 1920, "frame size");
	userName := flagSet.StringP("user", "u", "", "from user name");
	sleepTime := flagSet.Uint32P("packet-delay", "d", 0, "milliseconds to sleep between packets");
	serverId := flagSet.Uint32P("server", "s", 0, "server id");
	bigEndian := flagSet.BoolP("big-endian", "e", false, "use big endianness when encoding");
	fileFlag := flagSet.BoolP("file", "f", false, "use file as input");

	flagSet.Parse(args);

	err, server := getServerById(client, *serverId);
	err, user := getUserByName(client, *userName, server);

	var dat []byte;

	if (*fileFlag == true){
		filePath := flagSet.Arg(0);
		dat, err = os.ReadFile(filePath)
	}else{
		hexArgs := flagSet.Args();
		hexStr := strings.TrimSpace(strings.Join(hexArgs, ""));
		dat, err = hex.DecodeString(hexStr);
	}

	if err != nil {
		panic(err)
	}
	
	datLen := uint32(len(dat));

	ctx, cancel := getCtx();
	defer cancel();

	message := MurmurRPC.SpoofAudioMessage{
		User: user,
		Server: server,
		Data: dat,
		Len: &datLen,
		Sleep: sleepTime,
		BigEndian: bigEndian,
		Bitrate: bitrate,
		Framesize: frameSize,
		Samplerate: sampleRate,
	}

	client.SpoofAudio(ctx, &message)

	return nil, ""
}

