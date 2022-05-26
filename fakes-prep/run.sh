#/usr/bin/env sh

ffmpeg -f concat -safe 0 -i ./ffmpeg_files/concat0.txt -codec copy ./output/0.wav
ffmpeg -f concat -safe 0 -i ./ffmpeg_files/concat1.txt -codec copy ./output/1.wav
ffmpeg -f concat -safe 0 -i ./ffmpeg_files/concat2.txt -codec copy ./output/2.wav
