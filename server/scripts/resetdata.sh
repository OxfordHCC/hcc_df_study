#! /bin/sh

read -n "Reset database (y/n)?"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
	echo "resetting database"
	cd ../db && rm main.db && sqlite3 main.db ".read init.sql"
fi

read -n "Reset docker container (y/n)?"
read answer

if [ "$answer" != "${answer#[Yy]}" ] ;then
	echo "Resetting mumble containers and their mounts"
	docker ps -q -a --filter ancestor=mumble_server | awk 'BEGIN{}{system("docker stop "$0); system("docker rm "$0)}END{}';
	rm -r ../var/rec/*;
fi

