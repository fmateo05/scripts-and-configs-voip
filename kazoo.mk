################################################################################
#
# libxml2
#
################################################################################

KAZOO_VERSION = 4.3
#KAZOO_VERSION = 8987a5333a530c58e03591c7e30a4a22d8fd4d0a
KAZOO_SITE = https://github.com/2600hz/kazoo
KAZOO_SITE_METHOD = git
#KAZOO_INSTALL_STAGING = YES
#KAZOO_LICENSE = MIT
#KAZOO_LICENSE_FILES = COPYING
#KAZOO_CONFIG_SCRIPTS = xml2-config

# relocation truncated to fit: R_68K_GOT16O
KAZOO_CONF_ENV +=  PATH="/mnt/project/buildroot-kazoo-4.3-xfs/buildroot-2019.08/output/host/bin:$(PATH)" CC=$(TARGET_CC) LD=$(TARGET_LD)
define KAZOO_BUILD_CMDS
$(KAZOO_CONF_ENV) $(MAKE) -C $(@D)
$(KAZOO_CONF_ENV) $(MAKE) -C $(@D) build-release

endef





$(eval $(generic-package))

