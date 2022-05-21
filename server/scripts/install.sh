#/usr/bin/env sh

DIRNAME=$(dirname "$0")
cd $DIRNAME

USERNAME=$(id -u -n)
ROOT=$(npm prefix)

# move build files to abs path
cp -r $ROOT/build/ /opt/hcc_voice_study/

# install systemd.unit file
cat >/etc/systemd/user/hcc_voice_study.service <<EOF
[Unit]
Description=HCC Deepfakes Voice Study Server

[Service]
Type=simple
Restart=always
User=$USERNAME
ExecStart=nvm run --lts /opt/hcc_voice_study/main.js

[Install]
WantedBy=multi-user.target
EOF
