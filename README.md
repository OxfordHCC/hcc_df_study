# RETCON Deepfake Study

For the latest version of this document, go to https://github.com/treebirg/hcc_df_study;

This repository contains software needed to support the deepfake study.
## Repository structure
```
root/
├─ mumble/          - modified mumble version
├─ common/          - common libraries and resources
├─ admin/           - admin dashboard to monitor game progress
├─ game/            - bomb defusal game played by participants
├─ mumble-cli/       - tool used to issue audio injection commands to mumble
├─ server/          - study server
├─ calibration_app/ - web-based audio recording tool + list of sentences
├─ mams-parser/     - convert mumble recordings files to pcm
```


# Prereqs
- Docker is required to run the study server
- Make sure the murmur server docker image is built by running `docker-compose build murmur`

# Mumble

## Murmur (mumble server)

You can either follow instructions in the mumble documentation or, with docker and docker-compose installed, you can just run `docker-compose up --build murmur` in the root directory (the one containing the docker-compose.yml file). 

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
