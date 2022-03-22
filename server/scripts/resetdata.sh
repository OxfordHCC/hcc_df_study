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
	docker ps --filter ancestor=mumble_server | tail -1 | awk 'BEGIN{}{system("docker stop "$0)}END{}' && docker container prune;
	rm -r ../var/rec/*;
fi

