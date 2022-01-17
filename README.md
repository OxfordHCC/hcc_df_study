This repo contains software needed to support the deepfake study.

# Mumble
## Murmur (mumble server)

You can either follow instructions in the mumble documentation or, with docker and docker-compose installed you can just run in the root directory (the one containing the docker-compose.yml file).

```sh
> docker-compose up --build
```

## Mumble client
### Prebuilt binary
Download the prebuilt binaries for your platform from the official mumble website at 
https://www.mumble.info
### From source
The mumble source directory also contains the source code of the mumble client. You can follow the mumble install instructions on how to compile it.

## Dev guide
The protobuf file (/mumble/src/murmur/MurmurRPC.proto) has been extended for this study to include a remote procedure call for audio injection: 

```protobuf
[...]
// Deepfake study message

message AudioInjection{
	optional Server server = 1;
	optional User user = 2;
	optional bytes data = 3;
	optional uint32 len = 4;
	optional uint32 sleep = 5;
}

service V1 {
	// Deepfake study
	rpc InjectAudio(AudioInjection) returns(Void);
[...]
```

This protobuf file is also used by the study-cli. It is linked directly from the murmur directory.

As indicated in the murmur grpc documentation, each grpc procedure has a "sibling" function in mumble/src/murmur/MurmurGRPCImpl.cpp which contains the actual implementation of the function. In our case, this function is ```V1_InjectAudio::impl(bool)```. Inside this function, we parse the request parameters and then proceed to encode the audio data using the opus codec.

We define a max length for the packet we want to send, split the data in chunks of this size then encode each chunk, append the necessary headers and call the server function that sends messages to users (```void Server::sendMessage(ServerUser *u, const char *data, int len, QByteArray &cache, bool force)``` in mumble/src/murmur/Server.cpp).

Since this audio is not "organic", we need to introduce artificial latency by sleeping the thread (this is actually in the Sleep parameter of the AudioInjection message). Despite the GRPC server running on a separate thread, the implementation functions run on the main thread. From testing, this causes the server to miss some pings from clients, making them disconnect. Therefore, we need to do the splitting, encoding, packaging and sleeping on a separate thread.


# Study CLI (/study-cli)

The study cli is used as a remote control for the murmur server. It communicates over GRPC. To see the full GRPC spec of murmur, see the protobuf file in mumble/src/murmur/MurmurRPC.proto. Only a subset of the GRPC procedures are currently supported by the study-cli, as detailed below.

## Commands

Send audio clip to target so that only the target can hear it.

### Send audio to user

```
> study-cli send --help
Usage of send:
  -e, --big-endian            use big endianness when encoding
  -b, --bitrate uint32        bitrate (default 32000)
  -f, --file                  use file as input
  -p, --frame-size uint32     frame size (default 1920)
  -d, --packet-delay uint32   milliseconds to sleep between packets
  -r, --sample-rate uint32    sample rate (default 48000)
  -s, --server uint32         server id
  -t, --target uint32         to user id
  -u, --user uint32           from user id
```

The source user id is used to signal the source of the audio packets to the target user (e.g. in the mumble client, the source user icon will blink).

The delay parameter introduces artificial latency in the speech by waiting the specified amount between sneding packets to the target user. This value may need tweaking depending on the charactersitics of the input wave file. For a 48khz sample rate wav, a 20ms delay seems to be ok.

### List of servers running ar remote address

```
> study-cli servers
```

Return a list of servers running at a murmur instance, including their id, state and uptime.

### Users

```
> study-cli users --help
Usage: users <server-id>
```
Returns the list of users connected to a particular server. The list contains their id and username

## Planned commands
### Shell
Interactive grpc session between study-cli user and the murmur server. Could be useful if you want to re-use the grpc connection between commands.

### Spoof
Similar to `send`, but instead of sending audio to a single user, the audio is sent to the whole room.

# Game
	Bomb defusal game played by participants.
# Admin
	Admin dashboard to monitor game progress.
