#!/bin/bash
umask 077
declare -a PRKEY
declare -a PBKEY
export DIR="server_profile"
export SRV_FILE="wg0.conf"
export IP_ADDR="192.168.10"
export PEER="$2"

function header_server(){
if [ ! -d "$DIR" ]; then 

mkdir $DIR

fi


echo   '[Interface]' > $DIR/$SRV_FILE
echo   "Address = ${IP_ADDR}.254/24" >> $DIR/$SRV_FILE
echo   "SaveConfig = false" >> $DIR/$SRV_FILE
echo   "ListenPort = 1194" >> $DIR/$SRV_FILE
echo   "PrivateKey = ${PRKEY[0]}" >> $DIR/$SRV_FILE

}

function server_profile(){
#let "a=$a+1"
#echo -n "[Peer]" >> $DIR/$SRV_FILE
#echo -n "PublicKey =" >> $DIR/$SRV_FILE

echo  "[Peer]" >> $DIR/$SRV_FILE
echo  "PublicKey = ${PBKEY[$a]}" >> $DIR/$SRV_FILE
echo  "AllowedIPs = ${IP_ADDR}.${a}/32" >> $DIR/$SRV_FILE

}

function client_profile() {
export CLDIR="client_profiles"
export FILE="wg-client$a.conf"

if [ ! -d "$CLDIR" ]; then
mkdir $CLDIR

fi
echo   "[Interface]" > $CLDIR/$FILE
echo   "Address = ${IP_ADDR}.$a/32" >> $CLDIR/$FILE
echo  "PrivateKey = ${PRKEY[$a]}" >> $CLDIR/$FILE
echo   "DNS = 208.67.222.222" >> $CLDIR/$FILE
#echo -n  "" >> $CLDIR/$FILE
echo  "[Peer]" >> $CLDIR/$FILE
echo  "PublicKey = ${PBKEY[$a]}" >> $CLDIR/$FILE
echo  "Endpoint = ${PEER}:1194"  >> $CLDIR/$FILE
echo  "AllowedIPs = 0.0.0.0/0" >> $CLDIR/$FILE
echo  "PersistentKeepalive = 21" >> $CLDIR/$FILE

}

for ((c=0; c<1 ;c++))
do
KEY="`wg genkey`"
PUBKEY="`echo -n $KEY | wg pubkey`"
PRKEY[$a]=$KEY
PBKEY[$a]=$PUBKEY

header_server


done

a=1
while [[ $a -lt ${1} ]]

do
KEY="`wg genkey`"
PUBKEY="`echo -n $KEY | wg pubkey`"
PRKEY[$a]=$KEY
PBKEY[$a]=$PUBKEY



server_profile
client_profile

# echo ${PRKEY[$a]}
# echo ${PBKEY[$a]}

let "a++"
done
