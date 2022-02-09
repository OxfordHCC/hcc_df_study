# Study-cli

This cli tool is used to issue commands to a murmur instance.

It communicates using GRPC. To see the full GRPC spec of murmur, see the protobuf file in mumble/src/murmur/MurmurRPC.proto. Only a subset of the GRPC procedures are currently supported by the study-cli, as detailed below.

## Usage and commands

In the `/study-cli` directory, either run the tool as `go run . <subcommand> [args...]`, or compile using `go build` and then run the resulting binary (e.g. `./study-cli <subcommand> [args...]`.

```sh
> study-cli --help
Subcommands:
 send 
 users 
 servers
```

### Send audio to user

Send audio to user `t` as if coming from user `u`.

```sh
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

The delay parameter introduces artificial latency in the speech by waiting the specified amount between sneding packets to the target user. This value may need tweaking depending on the charactersitics of the input wave file. For a 48khz sample rate wav, a 20ms delay seems to be ok.

### List of servers running ar remote address

```sh
> study-cli servers
```

Return a list of servers running at a murmur instance, including their id, state and uptime.

### Users

```sh
> study-cli users --help
Usage: users <server-id>
```
Returns the list of users connected to a particular server. The list contains their id and username

## Planned commands
### Shell
Interactive grpc session between study-cli user and the murmur server. Could be useful if you want to re-use the grpc connection between commands.

### Spoof
Similar to `send`, but instead of sending audio to a single user, the audio is sent to the whole room.
