################################################################################
#
# libxml2
#
################################################################################

COUCHDB_VERSION = 2.3.1
COUCHDB_SOURCE = apache-couchdb-$(COUCHDB_VERSION).tar.gz
COUCHDB_SITE = https://www-eu.apache.org/dist/couchdb/source/$(COUCHDB_VERSION)
COUCHDB_SITE_METHOD = https
#COUCHDB_INSTALL_STAGING = YES
#COUCHDB_LICENSE = MIT
#COUCHDB_LICENSE_FILES = COPYING
#COUCHDB_CONFIG_SCRIPTS = xml2-config

# relocation truncated to fit: R_68K_GOT16O
ifeq ($(BR2_m68k_cf),y)
COUCHDB_CONF_ENV += CFLAGS="$(TARGET_CFLAGS) -mxgot"
endif

define COUCHDB_CONFIGURE_CMDS
 cd $(@D) ; ./configure
endef

#COUCHDB_CONF_OPTS = --with-gnu-ld --without-python --without-debug

define COUCHDB_BUILD_CMDS 
PATH="/mnt/project/buildroot-kazoo-4.3-xfs/buildroot-2019.08/output/host/bin:/mnt/project/buildroot-kazoo-4.3-xfs/buildroot-2019.08/output/host/sbin:/usr/local/bin:/usr/local/sbin:/usr/bin:/home/felipe/.local/share/flatpak/exports/bin:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl" $(MAKE) -C $(@D) release
endef


$(eval $(autotools-package))

