# install dependencies
apt-get install libpq-dev pkg-config build-essential bison make libperl-dev git linux-headers-$(uname -r) libunistring-dev flex libjson-c-dev libevent-dev 

# download & compile
cd /usr/src
git clone git://git.sip-router.org/kamailio kamailio-git
cd kamailio-git

# include your own modules, these are what i compile
make include_modules="db_postgres debugger usrloc dispatcher registrar auth auth_db avp avpops tm rr pv sl maxfwd nathelper textops siputils uac uac_redirect db_text xlog sanity htable app_perl path ctrl tls ctl mi_fifo kex permissions dmq dialog websocket xhttp textopsx sdpops kazoo tmx uuid presence presence_xml presence_dialoginfo presence_mwi outbound" cfg

make all

make install

# add kam group/user
groupadd -g 6001 kamailio
useradd -u 6001 -g 6001 -d /usr/local/kamailio -M -s /bin/false kamailio

# create custom directories for kamailio
mkdir -p /usr/local/kamailio/{run,etc,tmp}

# create kamailio default file
cat >/etc/default/kamailio <<EOT
RUN_KAMAILIO=yes
USER=kamailio
GROUP=kamailio
SHM_MEMORY=64
PKG_MEMORY=8
PIDFILE=/usr/local/kamailio/run/kamailio.pid
CFGFILE=/usr/local/kamailio/etc/kamailio.cfg
#DUMP_CORE=yes
EOT

# create systemd file
cat >/etc/systemd/system/kamailio.service<<EOT
[Unit]
Description=Kamailio (OpenSER) - the Open Source SIP Server
After=syslog.target network.target

[Service]
Type=forking
EnvironmentFile=-/etc/default/kamailio
PIDFile=\$PIDFILE
# ExecStart requires a full absolute path
ExecStart=/usr/local/sbin/kamailio -P \$PIDFILE -f \$CFGFILE -m \$SHM_MEMORY -M \$PKG_MEMORY -u \$USER -g \$GROUP
ExecStopPost=/bin/rm -f \$PIDFILE
Restart=on-abort

[Install]
WantedBy=multi-user.target

EOT

# enable kamailio service
systemctl enable kamailio

# if you change the systemd file you can reload changes with:
systemctl daemon-reload

# set permissions to /usr/local/kamailio
chown kamailio:kamailio -R /usr/local/kamailio
