#!/bin/bash
umask 077
declare -ga PRKEY
declare -ga PBKEY
export DIR="server_profile"
export SRV_FILE="wg0.conf"
export IP_ADDR="192.168.10"
export PEER="${2}"
export NUMBER="${1}"
#export a=0
#export b=0
#KEY="`wg genkey`"
#PUBKEY="`echo  $KEY | wg pubkey`"

function header_server(){
if [ ! -d "$DIR" ]; then 

mkdir $DIR

fi
if [ ! -f "$DIR/$SRV_FILE" ] ; then
cat << EOF | tee  $DIR/$SRV_FILE 
[Interface]
Address = ${IP_ADDR}.254/24
SaveConfig = false
ListenPort = 1194
PrivateKey = ${PRKEY[1]}
EOF
else
echo 111
fi
}

function server_profile(){

cat << EOF | tee -a  $DIR/$SRV_FILE 
[Peer]
PublicKey = ${PBKEY[a]}
AllowedIPs = ${IP_ADDR}.$a/32
EOF
}

function client_profile() {
export CLDIR="client_profiles"
export FILE="wg-client$a.conf"
if [ ! -d "$CLDIR" ]; then
mkdir $CLDIR

fi

#let "z=z+1"
cat  << EOF | tee  $CLDIR/$FILE 
[Interface]
Address = ${IP_ADDR}.$a/32
PrivateKey = ${PRKEY[$a]}
DNS = 208.67.222.222
[Peer]
PublicKey = ${PBKEY[1]}
Endpoint = ${PEER}:1194
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 21
EOF
}

function exec_all() {
header_server
server_profile
client_profile
}

function exec_clients(){
server_profile
client_profile

}



function generate_keys() {

a=1
while [[ $a -le ${NUMBER} ]]
do
PRKEY[$a]="`wg genkey`"
PBKEY[$a]="`echo -n ${PRKEY[$a]} | wg pubkey`"

header_server
server_profile
client_profile
let "a++"

done
}
generate_keys
