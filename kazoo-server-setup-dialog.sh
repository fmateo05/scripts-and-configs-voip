#!/bin/bash

function hostname_conf() {
HOSTNAME="/tmp/hostname.tmp.$$"
dialog --backtitle "${BACKTITLE}" --title "[ Host Name ]" --inputbox "Input the new system hostname (ie: hostname.example.com )" 10 80  2> ${HOSTNAME}
sleep 3
hostnamectl set-hostname $(<${HOSTNAME})
echo "127.0.1.1 $(hostname -f) $(hostname -f | cut -d"." -f1)" >> /etc/hosts

}

function ipaddr_conf() {
NETFILE="/tmp/eth0.tmp.$$"
ADDR="/tmp/address.tmp.$$"
NETMASK="/tmp/netmask.tmp.$$"
GW="/tmp/gw.tmp.$$"
dialog --backtitle "${BACKTITLE}" --title "[ Static IP Address Setup ]" --inputbox "Enter the server's IP address" 10 80  2> ${ADDR}
sleep 2
dialog --backtitle "${BACKTITLE}" --title "[ Static IP Address Setup ]" --inputbox "Enter the network mask (ie. 255.255.255.0)" 10 80 2> ${NETMASK}
sleep 2 
dialog --backtitle "${BACKTITLE}" --title "[ Static IP Address Setup ]" --inputbox "Enter the default gateway" 10 80  2> "${GW}"
sleep 1
echo "auto eth0" > ${NETFILE}
echo "iface eth0 inet static" >> ${NETFILE}
echo "address $(<${ADDR})" >> ${NETFILE}
echo "netmask $(<${NETMASK})" >> ${NETFILE}
echo "gateway $(<${GW})" >> ${NETFILE}
echo "dns-nameservers 8.8.4.4" >> ${NETFILE}
\cp -v ${NETFILE} /etc/network/interfaces.d/eth0 
systemctl restart networking
	}

function setup_services() {
IP=$(ip route get 8.8.8.8 | awk -F"src " 'NR==1{split($2,a," ");print a[1]}')
if [ -z  ${IP} ] ; then
dialog --backtitle "$BACKTITLE" --title '[ IP address ]'  --msgbox 'IP address is not configured, please go to previous options to set it up' 10 70
else
sed -i "s/0.0.0.0/${IP}/g" /etc/kazoo/kamailio/local.cfg
fi

systemctl enable kazoo-rabbitmq kazoo-couchdb kazoo-freeswitch kazoo-haproxy kazoo-applications kazoo-ecallmgr kazoo-kamailio
systemctl start kazoo-rabbitmq 
sleep 4
systemctl start kazoo-couchdb 
systemctl start kazoo-freeswitch 
sleep 4
systemctl start  kazoo-haproxy 
systemctl start kazoo-applications kazoo-kamailio
sleep 18
systemctl start kazoo-ecallmgr   

}

function  master_account() {
IP=$(ip route get 8.8.8.8 | awk -F"src " 'NR==1{split($2,a," ");print a[1]}')
TEST_SVC=$(sup kapps_controller list_apps | cut -d "[" -f2 | cut -d"]" -f1  | tr "," " " | wc -w  )
USER="/tmp/user.tmp.$$"
PASSWD="/tmp/passwd.tmp.$$"
ACCT="/tmp/acct.tmp.$$"
dialog --backtitle "${BACKTITLE}" --title "[ Master account setup ]" --inputbox "Enter the account's Username: " 0 0  2> ${USER}
dialog --backtitle "${BACKTITLE}" --title "[ Master account setup ]" --passwordbox "Enter the account's Password: " 0 0  2> ${PASSWD}
dialog --backtitle "${BACKTITLE}" --title "[ Master account setup ]" --inputbox "Enter the account Name : " 0 0   2> ${ACCT}
sleep 2 

if [ -z "$USER" ] ; then
dialog --backtitle "${BACKTITLE}" --title "[ Master Account Setup ]" --infobox "Username is Empty"  0 0 ; sleep 2

elif [ -z "$PASSWD" ] ; then
dialog --backtitle "${BACKTITLE}" --title "[ Master Account Setup ]" --infobox "Password is Empty" 0 0  ; sleep 2


elif [ -z "$ACCT" ] ; then
dialog --backtitle "${BACKTITLE}" --title "[ Master Account Setup ]" --infobox "Account is Empty" 0 0 ; sleep 2

else 
for (( i = 0 ; i > ${TEST_SVC} ; i++))
do
dialog --infobox "Waiting for Kazoo Applications to start up... ( ${TEST_SVC} )" 10 70 ; sleep 3
done
sup crossbar_maintenance create_account $(cat $ACCT) sip.localhost  $(cat $USER) $(cat $PASSWD)
sup crossbar_maintenance init_apps /var/www/html/apps "http://${IP}:8000/v2/"
fi


}

function sounds_import() {

dialog --backtitle "$BACKTITLE" --title '[ Choose the desired language(s) for import ]' --menu "Languages" 0 0 0 1 "English" 2 "French" 3 "Russian"   2> "${INPUT}"

opt=$(<"${INPUT}")
case $opt in 
	1)
(cd /opt/kazoo ;  tar -xzf /opt/kazoo/kazoo-sounds.tar.gz kazoo-sounds/kazoo-core/en && sup kazoo_media_maintenance import_prompts /opt/kazoo/kazoo-sounds/kazoo-core/en/us)
	  ;;
	2)
( cd /opt/kazoo ;  tar -xzf /opt/kazoo/kazoo-sounds.tar.gz kazoo-sounds/kazoo-core/fr && sup kazoo_media_maintenance import_prompts /opt/kazoo/kazoo-sounds/kazoo-core/fr/ca )
	 ;;
	3)
( cd /opt/kazoo ;  tar -xzf /opt/kazoo/kazoo-sounds.tar.gz kazoo-sounds/kazoo-core/ru && sup kazoo_media_maintenance import_prompts /opt/kazoo/kazoo-sounds/kazoo-core/ru/ru )
	 ;;
	*) echo "Invalid Option $REPLY";;	
esac

}

function front_page() {
BACKTITLE='Kazoo server post-configuration'

dialog --backtitle "$BACKTITLE" --title '[ Choose the desired options ]' --menu "Settings Menu" 0 0 0 1 "Set system hostname" 2 "Set-up IP Address" 3 "Enable and Start services" 4 "Create Master account" 5 "Import language sounds" 6 "Exit"  2> "${INPUT}"

menuitem=$(<"${INPUT}")


case $menuitem in
	1) hostname_conf;;
	2) ipaddr_conf;;
	3) setup_services ;;
	4) master_account ;;
	5) sounds_import ;;
	6) exit ;;
esac
}

function initial_setup(){ 
RETVAL=$?	

dialog --backtitle "$BACKTITLE" --title '[ Welcome ]'  --msgbox 'Welcome to kazoo. This menu will guide to configure the initial settings needed for start using it ' 10 70
trap ctrl_c INT

function ctrl_c() {
        echo "** Trapped CTRL-C"
}

for i in `seq 1 5`; do
    sleep 1
    echo -n "."
    front_page
done

	}

INPUT=/tmp/menu.sh.$$
OUTPUT="/tmp/input.txt"
> $OUTPUT
initial_setup
