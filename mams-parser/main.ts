/*

Tested with node.js 16

This takes mumble stream recordings and converts them to pcm data.
Usage: npx ts-node <input_file>

An output file will be created (or replaced!) in the same directory as
the input file and will contain the raw pcm data of the recording.

To play the output file:

ffplay -f s16le -ar 48k -ac 1 <path_to_outputfile>

You should be able to wrap this with ffmpeg into a proper wav file
using ffmpeg as well:

ffmpeg -f s16le -ar 48k -ac 1 -i file.pcm file.wav


TODO:

We need to find a way to overlay the "real" time with this recording,
because right now any pause is simply skipped (silence is not
recorded). The mumble recording files include a timestamp in the
header (extracted below, but not used).

A couple of ways we could do this is: 1. visual overlay somehow OR,
even better: 2. Introduce "pauses" in the pcm data.

But how do we know when to introduce these pauses?  I think mumble
audio packets have a "termination" bit in their headers.  If these
termination bits can accurately identify end of utterances, we could
simply add "silence" (not sure how in pcm, but maybe something like
0xFF * seconds * whatever bitrate we have), between packets with
terminating bits set and the next packet. The time can be induced from
the respective packets timestamps.


*/

import fs from 'fs/promises';
import { Buffer } from 'buffer';
import path from 'path';
import { OpusEncoder } from '@discordjs/opus';

const inputFile = process.argv[2];
const inputPathObj = path.parse(inputFile);

const outputFile = path.format({
	ext: ".pcm",
	name: inputPathObj.name,
	dir: inputPathObj.dir
});

// mumble-specific header to id opus packets
const opusHeader = 0b10000000;



// Create the encoder.
// Specify 48kHz sampling rate and 2 channel size.
const encoder = new OpusEncoder(48000, 1);

// note: does not support negative recursive varints
function readVarInt(buffer: Buffer, position: number): [number, number] {
	const varintHead = buffer[position];

	// these bitwise operations are largely copied from the mumble implementation:
	// https://github.com/mumble-voip/mumble/blob/master/src/PacketDataStream.h
	if ((varintHead & 0x80) === 0x00) {
		// 0xxxxxxx = 7 bit positive number
		const x = varintHead & 0x7f;
		return [x, 1];
	}
	if ((varintHead & 0xC0) === 0x80) {
		// 10xxxxxx + 1 byte = 14 bit positive number
		const x = (varintHead & 0x3F) << 8
			| buffer[position + 1];
		return [x, 2];
	}
	if ((varintHead & 0xF0) === 0xF0) {
		if ((varintHead & 0xFC) === 0xF0) {
			// 111100__ - + 4 bytes = 32 bit
			const x = buffer[position + 1] << 24
				| buffer[position + 2] << 16
				| buffer[position + 3] << 8
				| buffer[position + 4];
			return [x, 5];
		}
		if ((varintHead & 0xFC) === 0xF4) {
			//111101__ - + 8 bytes = 64 bit
			const x = buffer[position + 1] << 56
				| buffer[position + 2] << 48
				| buffer[position + 3] << 40
				| buffer[position + 4] << 32
				| buffer[position + 5] << 24
				| buffer[position + 6] << 16
				| buffer[position + 7] << 8
				| buffer[position + 8];
			return [x, 9];
		}
		if ((varintHead & 0xFC) === 0xFC) {
			//111111xx = byte-inverted negative 2 bit number
			let x = varintHead & 0x03;
			x = ~x;
			return [x, 1];
		}
	}
	if((varintHead & 0xF0) == 0xE0){
		// 1110xxxx + 3 bytes = 28 bit number
		const x = varintHead & 0x0F << 24
			| buffer[position + 1] << 16
			| buffer[position + 2] << 8
			| buffer[position + 3];
		return [x, 4];
	}
	if((varintHead & 0xE0) == 0xC0){
		// 110xxxxx + 2 bytes = 21 bit
		const x = varintHead & 0x1F << 16
			| buffer[position + 1] << 8
			| buffer[position + 2];
		return [x, 3];
	}
	return [0,0];

}

function extractOpusData(buffer: Buffer) {
	let bufferPointer = 1;
	const [sequence, seqBytes] = readVarInt(buffer, bufferPointer);
	bufferPointer += seqBytes;
	const [length, lenBytes] = readVarInt(buffer, bufferPointer);
	bufferPointer += lenBytes;
	const dataBuffer = Buffer.alloc(length);
	buffer.copy(dataBuffer, 0, bufferPointer, bufferPointer + length);

	
	if(length > buffer.length){
		// I think this happens because of the termination bit in the
		// opus packet header. What we're doing right now is we're
		// skipping these "end of transmission" packets, but we don't
		// have to.
		return null;
		console.log("length: ", length);
		console.log("buffer length: ",buffer.length);
		console.log("dataBuffer length: ", dataBuffer.length);
		console.log(buffer);
	}

	return dataBuffer;
}

function extractData(buffer:Buffer){
	const header = buffer[0];
	const isOpus = (opusHeader & header) === opusHeader;
	
	if(isOpus){
		return extractOpusData(buffer);
	}
	
	return null;
}

async function main(inputFile: string, outputFile: string) {
	console.log("Output file: ",outputFile);
	
	const outFd = await fs.open(outputFile, "w");
	const outStream = outFd.createWriteStream();
	
	const fd = await fs.open(inputFile, "r");
	let running = true;
	let outNeedsDrain = false;

	outStream.on("drain", () => {
		outNeedsDrain = false;
	});

	while (running) {
		if (outNeedsDrain) {
			// pause processing if outputstream is draining
			continue;
		}
		
		const header = Buffer.alloc(12);
		const { bytesRead } = await fd.read(header, 0, 12, null);
		
		if(bytesRead === 0){
			running = false;
			continue;
		}

		const timestamp = header.readBigInt64LE();
		const len = header.readInt32LE(8);
		const chunk = Buffer.alloc(len);
		const bodyRead = await fd.read(chunk, 0, len, null);
		const data = extractData(chunk);
		if(data === null){
 			continue;
 		}
		const decoded = encoder.decode(data);
		outNeedsDrain = !(outStream.write(decoded));
	}
}

main(inputFile, outputFile);
