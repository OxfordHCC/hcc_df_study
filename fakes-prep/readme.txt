
Add 1s of silence to your wav files.

==== Automatic

Place all your fakes in the input_files dir and run ./run.sh.
The files need to be named 0.wav, 1.wav and 2.wav.

==== Manual

1. ffmpeg -f lavfi -i anullsrc=channel_layout=1:sample_rate=16000 -t 1 silence.wav 
2. then create file with contents:

file 'silence.wav'
file '<clip>.wav'

3. ffmpeg -f concat -i input.txt -codec copy output.wav
4. mv output.wav <clip>.wav
