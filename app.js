define("apps/mobile/app", ["require", "jquery", "lodash", "monster"], function(t) {
    var n = t("jquery")
      , e = t("lodash")
      , l = t("monster");
    return {
        name: "mobile",
        css: ["app"],
        i18n: {
            "en-US": {
                customCss: !1
            },
            "fr-FR": {
                customCss: !1
            }
        },
        requests: {
            "top.devices.get": {
                url: "accounts/{accountId}/devices/{deviceId}",
                verb: "GET",
                generateError: !1
            },
            "top.devices.patch": {
                url: "accounts/{accountId}/devices/{deviceId}",
                verb: "PATCH"
            },
            "top.devices.list": {
                url: "accounts/{accountId}/devices",
                verb: "GET"
            },
            "top.devices.validate": {
                url: "devices/{esn}/validity",
                verb: "GET",
                generateError: !1
            },
            "top.devices.activate": {
                url: "accounts/{accountId}/devices",
                verb: "PUT"
            },
            "top.devices.deactivate": {
                url: "accounts/{accountId}/devices/{deviceId}",
                verb: "DELETE"
            },
            "top.devices.subscription.update": {
                url: "accounts/{accountId}/devices/{deviceId}/subscription",
                verb: "POST"
            },
            "top.devices.usage": {
                url: "accounts/{accountId}/devices/{deviceId}/usage",
                verb: "GET"
            },
            "top.devices.suspend": {
                url: "accounts/{accountId}/devices/{deviceId}/suspension",
                verb: "PUT"
            },
            "top.devices.restore": {
                url: "accounts/{accountId}/devices/{deviceId}/suspension",
                verb: "DELETE"
            },
            "top.devices.replace": {
                url: "accounts/{accountId}/devices/{deviceId}/replace",
                verb: "POST",
                generateError: !1
            },
            "top.accounts.create": {
                url: "accounts/{accountId}",
                verb: "PUT",
                generateError: !1
            },
            "top.accounts.get": {
                url: "accounts/{accountId}",
                verb: "GET",
                generateError: !1
            },
            "top.accounts.update": {
                url: "accounts/{accountId}",
                verb: "POST"
            },
            "top.accounts.usage": {
                url: "accounts/{accountId}/usage",
                verb: "GET",
                generateError: !1
            },
            "top.accounts.usageCsv": {
                url: "accounts/{accountId}/usage/{month}/csv",
                verb: "GET",
                dataType: "csv",
                generateError: !1
            },
            "top.porting.get": {
                url: "accounts/{accountId}/ports/in/{portId}/",
                verb: "GET"
            },
            "top.porting.create": {
                url: "accounts/{accountId}/ports/in",
                verb: "PUT"
            },
            "top.porting.update": {
                url: "accounts/{accountId}/ports/in/{portId}",
                verb: "PUT"
            },
            "top.porting.list": {
                url: "accounts/{accountId}/ports/in",
                verb: "GET"
            },
            "top.porting.delete": {
                url: "accounts/{accountId}/ports/in/{portId}",
                verb: "DELETE"
            },
            "top.porting.validate": {
                url: "ports/{mdn}/validity?carrier={carrier}",
                verb: "GET"
            },
            "top.coverage.check": {
                url: "locality/coverage/{postalCode}",
                verb: "GET",
                generateError: !1
            },
            "google.geocode.address": {
                apiRoot: "https://portal.bevoip.net/",
                url: "maps/api/geocode/json?components=country:{country}|postal_code:{postalCode}",
                verb: "GET",
                removeHeaders: ["X-Kazoo-Cluster-ID", "X-Auth-Token", "Content-Type"]
            }
        },
        appFlags: {
            defaults: {
                account: {
                    data: {
                        throttling: {
                            cap: 0
                        },
                        blocking: {
                            cap: 0
                        }
                    },
                    device_defaults: {
                        data: {
                            throttling: {
                                cap: 0
                            },
                            blocking: {
                                cap: 0
                            }
                        },
                        features: ["mms"]
                    }
                }
            },
            usageWidget: {
                thresholds: {
                    warning: 80,
                    error: 100
                }
            },
            rates: [{
                value: "64k",
                text: "64 kB/s"
            }, {
                value: "128k",
                text: "128 kB/s"
            }, {
                value: "256k",
                text: "256 kB/s"
            }, {
                value: "512k",
                text: "512 kB/s"
            }],
            isPorting: !1,
            isActivating: !1
        },
        subscribe: {},
        load: function(t) {
            var n = this;
            n.initApp(function() {
                t && t(n)
            })
        },
        initApp: function(t) {
            var n = this;
            l.pub("auth.initApp", {
                app: n,
                callback: t
            })
        },
        render: function(t) {
            var a = this
              , i = e.isEmpty(t) ? n("#monster_content") : t
              , o = {
                menus: [{
                    tabs: [{
                        id: "devices",
                        text: a.i18n.active().mobileApp.menus.devicesList,
                        callback: a.renderDevicesList,
                        onClick: a.customMenuClickEvents.checkIfExitingWizard
                    }, {
                        text: a.i18n.active().mobileApp.menus.porting,
                        callback: a.renderPortingList,
                        onClick: a.customMenuClickEvents.checkIfExitingWizard
                    }]
                }, {
                    tabs: [{
                        text: a.i18n.active().mobileApp.menus.provisioning,
                        callback: a.renderProvisioningModelsListing,
                        onClick: a.customMenuClickEvents.checkIfExitingWizard
                    }, {
                        text: a.i18n.active().mobileApp.menus.checkCoverage,
                        callback: a.renderCheckCoverage,
                        onClick: a.customMenuClickEvents.checkIfExitingWizard
                    }]
                }]
            };
            i.empty(),
            l.parallel({
                account: function(t) {
                    a.requestTopGetAccount({
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                usage: function(t) {
                    a.requestTopGetAccountUsage({
                        success: function(n) {
                            t(null, n)
                        },
                        error: function() {
                            t(null, {})
                        }
                    })
                }
            }, function(t, r) {
                if (l.util.isReseller() && o.menus[0].tabs.push({
                    text: a.i18n.active().mobileApp.menus.accountSettings,
                    callback: a.renderAccountSettings,
                    onClick: a.customMenuClickEvents.checkIfExitingWizard
                }),
                l.ui.generateAppLayout(a, o),
                r.account.hasOwnProperty("id")) {
                    var s = a.formatUsageDataToWidget({
                        cap: r.account.data.blocking.cap,
                        usage: e.get(r.usage, "total", 0)
                    })
                      , c = n(a.getTemplate({
                        name: "accountUsage",
                        data: s
                    }));
                    i.find(".app-navbar").before(c),
                    i.find(".account-usage").fadeIn(function() {
                        i.find(".bar").css("width", s.percentage + "%")
                    })
                }
            })
        },
        customMenuClickEvents: {
            checkIfExitingWizard: function(t) {
                var n = this;
                n.appFlags.isActivating ? l.ui.confirm(n.i18n.active().mobileApp.confirmPopup.leavingActivation, function() {
                    n.appFlags.isActivating = !1,
                    t.callback()
                }) : t.callback()
            }
        },
        renderDevicesList: function(t) {
            var a = this
              , i = function(e) {
                var i = {
                    devices: e
                }
                  , o = n(a.getTemplate({
                    name: "devices-list",
                    data: i
                }));
                return l.ui.footable(o.find(".footable"), {
                    filtering: {
                        enabled: !0
                    }
                }),
                l.ui.tooltips(o),
                a.bindDevicesListEvents(o, n.extend(!0, {}, t, {
                    data: {
                        devices: e
                    }
                })),
                o
            };
            l.ui.insertTemplate(t.container, function(t) {
                l.waterfall([function(t) {
                    a.requestTopListDevices({
                        success: function(n) {
                            e.isEmpty(n) ? t(!0) : t(null, n)
                        },
                        error: function() {
                            t(!0)
                        }
                    })
                }
                , function(t, n) {
                    a.requestTopGetAccountUsage({
                        success: function(e) {
                            n(null, t, e)
                        },
                        error: function() {
                            n(!0)
                        }
                    })
                }
                ], function(n, o, r) {
                    n ? t(i()) : (e.each(o, function(t) {
			
                        t.userAgent = l.ua.getUserAgent(t.model.manufacturer + " " + t.model.name),
			// 1. Obtener la clave MDN de forma segura
currentMdn = t.mdn || (t.mobile && t.mobile.mdn) || (t.subscription && t.subscription.mdn) || "";

// 2. Garantizar que per_mdn exista como Objeto (evita el TypeError)
perMdnObj = (r && r.per_mdn) ? r.per_mdn : {};

// 3. Extraer el valor de consumo o usar 0 por defecto
usageVal = perMdnObj[currentMdn] || perMdnObj["+" + currentMdn] || 0;
                        t.widget = e.extend({
                            original_usage: usageVal
//                            original_usage: r.per_mdn[t.mdn] || 0
                        }, a.formatUsageDataToWidget({
                            cap: t.hasOwnProperty("data") ? t.data.blocking.cap : 0,
                         //   usage: r.per_mdn[t.mdn] || 0
                            usage:  0
                        }))
                    }),
                    t(i(o)))
                })
            })
        },


	/*
        renderDeviceInfo: function(t) {
		console.log("=== DEBUG MOBILE APP ===");
    console.log("1. t.data completo:", t.data);
    console.log("2. deviceId buscado:", t.data.deviceId);
    console.log("3. Dispositivos disponibles en t.data.devices:", t.data.devices);
            var a = this
              , i = t.data.devices[t.data.deviceId]
		console.log("4. Objeto de dispositivo encontrado (i):", i);
		if (!i) {
        console.error("CRÍTICO: No se encontró el dispositivo con ID:", t.data.deviceId, "dentro de t.data.devices!");
    }
               o = function(i) {
		var deviceVoice = (i.device && i.device.voice) ? i.device.voice : {};
                var o = {
                    isOffnetRoutingEnabled: false ,
//                    isOffnetRoutingEnabled: i.device.voice.dns || i.device.voice.cluster_id,
                    showRepairButton: !i.device.voice.dns && !i.device.voice.cluster_id && (e.isEmpty(i.kazooMobileDevice) || e.isEmpty(i.mobileCallflow)),
                    widget: a.formatUsageDataToWidget({
                  //      usage: i.usage.per_mdn[t.data.devices[t.data.deviceId].mdn] || 0,
                        usage: 100000,
                        cap: e.isObject(i.device.data) ? i.device.data.blocking.cap : 10000000000
                    }),
                    device: n.extend(!0, {}, i.device, {
                        features: i.device.subscription.features || [],
                        data: {
                            blocking: {
                                cap: e.isObject(i.device.data) ? Math.round(i.device.data.blocking.cap / 1e6) : 0
                            },
                            throttling: {
                                cap: e.isObject(i.device.data) ? Math.round(i.device.data.throttling.cap / 1e6) : 0,
                                rate: e.isObject(i.device.data) ? i.device.data.throttling.rate : a.appFlags.rates[0].value
                            }
                        },
                        userAgent: l.ua.getUserAgent(i.device.model.manufacturer + " " + i.device.model.name)
                    }),
                    usage: i.deviceUsage.hourly.reverse(),
                    rates: a.appFlags.rates,
                    unit: a.i18n.active().unitsMultiple.byte[2].symbol
                }
                  , r = n.extend(!0, {}, {
                    blocking: {
                        cap: 100000000
                    },
                    throttling: {
                        cap: 70000000,
                        rate: a.appFlags.rates[0].value
                    }
                }, i.device.data)
		      // Dentro de la función 'o' donde se arma el contexto para el template:
    console.log("5. Objeto 'o' formateado para la plantilla:", o);
    console.log("6. Archivo i18n activo cargado:", a.i18n.active().mobileApp);

                   s = n(a.getTemplate({
                    name: "deviceInfo",
                    data: o
                }));
		      console.log("7. HTML compilado resultante (s):", s.html());
		 
		try {
        l.ui.footable(s.find(".footable"), { filtering: { enabled: !0 } });
        console.log("8. Footable inicializado con éxito");
    } catch (errFootable) {
        console.error("ERROR al inicializar footable:", errFootable);
    }

    try {
        l.ui.slider(s.find("#device_slider"), a.generateSliderSettings(r));
        console.log("9. Slider inicializado con éxito");
    } catch (errSlider) {
        console.error("ERROR al inicializar slider:", errSlider);
    }


                return l.ui.footable(s.find(".footable"), {
                    filtering: {
                        enabled: !1
                    }
                }),
                l.ui.slider(s.find("#device_slider"), a.generateSliderSettings(r)),
                e.isObject(i.device.data) && i.device.data.blocking.cap > 0 ? (s.find("#device_limit_data_group").show(),
                s.find("#device_blocking_cap_group").show()) : (s.find("#device_limit_data_group").hide(),
                s.find("#device_blocking_cap_group").hide()),
                e.isObject(i.device.data) && i.device.data.throttling.cap > 0 ? s.find("#device_throttling_rate_group").show() : s.find("#device_throttling_rate_group").hide(),
		(deviceVoice && deviceVoice.cluster_id) ? s.find(".cluster-settings").show() : s.find(".cluster-settings").hide();
		// --- AGREGAR ESTO AL FINAL DE renderDeviceInfo ---

                // 1. Mostrar explícitamente la pestaña de información por defecto
                s.find('.info-content-wrapper').hide();
                s.find('.info-content-wrapper[data-tab="info"]').addClass('active').show();
                s.find('.navbar-menu-item-link').removeClass('active');
                s.find('.navbar-menu-item-link[data-tab="info"]').addClass('active');
                t.data.deviceInfo = i.device,
                t.data.reconcile = {
			device: (i.kazooMobileDevice && i.kazooMobileDevice.length) ? i.kazooMobileDevice[0] : null,
                    callflow: (i.mobileCallflow && i.mobileCallflow.length) ? i.mobileCallflow[0] : null,
                    device: i.kazooMobileDevice[0],
                    callflow: i.mobileCallflow[0]
                };
                  a.bindDeviceInfoEvents(s, t),
                 s.innerhtml();
            };
            delete t.data.reconcile,
            l.ui.insertTemplate(t.container, function(n) {
                l.parallel({
                    deviceUsage: function(t) {
                        a.requestTopGetDeviceUsage({
                            data: {
                                deviceId: i.id
                            },
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    account: function(t) {
                        a.requestTopGetAccount({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    usage: function(t) {
                        a.requestTopGetAccountUsage({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    device: function(n) {
                        a.requestTopGetDevice({
                            data: {
                                deviceId: t.data.deviceId
                            },
                            success: function(t) {
                                n(null, t)
                            }
                        })
                    },
                    kazooMobileDevice: function(t) {
                        a.requestKazooListDevices({
                            data: {
                                filters: {
                                    "filter_mobile.mdn": i.mdn
                                }
                            },
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    mobileCallflow: function(t) {
                        a.requestSearchCallflowsByNumbers({
                            data: {
                                value: i.mdn
                            },
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    }
                }, function(e, l) {
                    e ? a.renderDevicesList(t) : n(o(l))
                })
            }, {
                title: a.i18n.active().mobileApp.loadingTitles.titles.searchingDevice
            })
        },
	    */
	renderDeviceInfo: function(t) {
        console.log("=== DEBUG MOBILE APP ===");
        console.log("1. t.data completo:", t.data);
        console.log("2. deviceId buscado:", t.data.deviceId);
        console.log("3. Dispositivos disponibles en t.data.devices:", t.data.devices);

        var a = this,
            i = t.data.devices ? t.data.devices[t.data.deviceId] : null;

        console.log("4. Objeto de dispositivo encontrado (i):", i);

        if (!i) {
            console.error("CRÍTICO: No se encontró el dispositivo con ID:", t.data.deviceId, "dentro de t.data.devices!");
        }

        var o = function(res) {
            // Unificar el objeto del dispositivo
            var devObj = (res && res.device) ? res.device : (i ? i : {});
            var deviceVoice = devObj.voice ? devObj.voice : {};

            var oContext = {
                isOffnetRoutingEnabled: false,
                showRepairButton: !deviceVoice.dns && !deviceVoice.cluster_id && (e.isEmpty(res.kazooMobileDevice) || e.isEmpty(res.mobileCallflow)),
                widget: a.formatUsageDataToWidget({
                    usage: 100000,
                    cap: e.isObject(devObj.data) && devObj.data.blocking ? devObj.data.blocking.cap : 10000000000
                }),
                device: n.extend(!0, {}, devObj, {
                    features: (devObj.subscription && devObj.subscription.features) ? devObj.subscription.features : [],
                    data: {
                        blocking: {
                            cap: e.isObject(devObj.data) && devObj.data.blocking ? Math.round(devObj.data.blocking.cap / 1e6) : 0
                        },
                        throttling: {
                            cap: e.isObject(devObj.data) && devObj.data.throttling ? Math.round(devObj.data.throttling.cap / 1e6) : 0,
                            rate: e.isObject(devObj.data) && devObj.data.throttling ? devObj.data.throttling.rate : (a.appFlags.rates[0] ? a.appFlags.rates[0].value : '128k')
                        }
                    },
                    userAgent: l.ua.getUserAgent((devObj.model ? devObj.model.manufacturer : '') + " " + (devObj.model ? devObj.model.name : ''))
                }),
                usage: (res.deviceUsage && res.deviceUsage.hourly) ? res.deviceUsage.hourly.reverse() : [],
                rates: a.appFlags.rates,
                unit: a.i18n.active().unitsMultiple.byte[2].symbol
            };

            var r = n.extend(!0, {}, {
                blocking: { cap: 100000000 },
                throttling: { cap: 70000000, rate: a.appFlags.rates[0] ? a.appFlags.rates[0].value : '128k' }
            }, devObj.data);

            var s = n(a.getTemplate({
                name: "deviceInfo",
                data: oContext
            }));

            // Inicialización de componentes Footable y Slider
            try {
                l.ui.footable(s.find(".footable"), { filtering: { enabled: false } });
            } catch (errFootable) {
                console.error("ERROR al inicializar footable:", errFootable);
            }

            try {
                l.ui.slider(s.find("#device_slider"), a.generateSliderSettings(r));
            } catch (errSlider) {
                console.error("ERROR al inicializar slider:", errSlider);
            }

            // Visibilidad de controles según los caps
            if (e.isObject(devObj.data) && devObj.data.blocking && devObj.data.blocking.cap > 0) {
                s.find("#device_limit_data_group").show();
                s.find("#device_blocking_cap_group").show();
            } else {
                s.find("#device_limit_data_group").hide();
                s.find("#device_blocking_cap_group").hide();
            }

            if (e.isObject(devObj.data) && devObj.data.throttling && devObj.data.throttling.cap > 0) {
                s.find("#device_throttling_rate_group").show();
            } else {
                s.find("#device_throttling_rate_group").hide();
            }

            if (deviceVoice && deviceVoice.cluster_id) {
                s.find(".cluster-settings").show();
            } else {
                s.find(".cluster-settings").hide();
            }

            // Mostrar explícitamente la pestaña de información
            s.find('.info-content-wrapper').hide();
            s.find('.info-content-wrapper[data-tab="info"]').addClass('active').show();
            s.find('.navbar-menu-item-link').removeClass('active');
            s.find('.navbar-menu-item-link[data-tab="info"]').addClass('active');

            t.data.deviceInfo = devObj;
            t.data.reconcile = {
                device: (res.kazooMobileDevice && res.kazooMobileDevice.length) ? res.kazooMobileDevice[0] : null,
                callflow: (res.mobileCallflow && res.mobileCallflow.length) ? res.mobileCallflow[0] : null
            };

            a.bindDeviceInfoEvents(s, t);

            // IMPORTANTE: Retornar el elemento compilado jQuery para que insertTemplate lo renderice
            return s;
        };

        delete t.data.reconcile;

        l.ui.insertTemplate(t.container, function(nCallback) {
            l.parallel({
                deviceUsage: function(cb) {
                    a.requestTopGetDeviceUsage({
                        data: { deviceId: t.data.deviceId },
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, {}); }
                    });
                },
                account: function(cb) {
                    a.requestTopGetAccount({
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, {}); }
                    });
                },
                usage: function(cb) {
                    a.requestTopGetAccountUsage({
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, {}); }
                    });
                },
                device: function(cb) {
                    a.requestTopGetDevice({
                        data: { deviceId: t.data.deviceId },
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, {}); }
                    });
                },
                kazooMobileDevice: function(cb) {
                    a.requestKazooListDevices({
                        data: {
                            filters: {
                                "filter_mobile.mdn": i ? i.mdn : ""
                            }
                        },
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, []); }
                    });
                },
                mobileCallflow: function(cb) {
                    a.requestSearchCallflowsByNumbers({
                        data: {
                            value: i ? i.mdn : ""
                        },
                        success: function(res) { cb(null, res); },
                        error: function() { cb(null, []); }
                    });
                }
            }, function(err, results) {
                if (err) {
                    a.renderDevicesList(t);
                } else {
                    // Pasar el resultado compilado de 'o(results)' al callback de insertTemplate
                    nCallback(o(results));
                }
            });
        }, {
            title: a.i18n.active().mobileApp.loadingTitles.titles.searchingDevice
        });
    },


        renderEsnCheck: function(t) {
            var e = this
              , a = t.container
              , i = function() {
                var l = n(e.getTemplate({
                    name: "activation-esnCheck"
                }));
                return e.bindEsnCheckEvents(l, t),
                l
            };
            l.ui.insertTemplate(a, function(t) {
                t(i(), function() {
                    a.find("#esn").focus()
                })
            })
        },
        renderDeviceValidation: function(t) {
            var e = this
              , a = function(l) {
                var a = {
                    isInUse: "in_use" === l.reason,
                    isValid: l.valid
                }
                  , i = n(e.getTemplate({
                    name: "activation-deviceValidation",
                    data: a
                }));
                return e.appFlags.isActivating = l.valid,
                t.data.isSimRequired = l.sim_required,
                e.bindDeviceValidationEvents(i, t),
                i
            };
            l.ui.insertTemplate(t.container, function(n) {
                e.requestTopValidateDevice({
                    data: {
                        esn: t.data.esn
                    },
                    success: function(t) {
                        n(a(t))
                    },
                    error: function() {
                        e.renderEsnCheck(t)
                    }
                })
            }, {
                title: e.i18n.active().mobileApp.loadingTitles.titles.validatingDevice
            })
        },
        renderCheckCoverage: function(t) {
            var e = this
              , a = t.container
              , i = function() {
                var l = {
                    isActivating: e.appFlags.isActivating,
                    postalCode: t.hasOwnProperty("data") ? t.data.postalCode : void 0
                }
                  , a = n(e.getTemplate({
                    name: "coverage-checkZipCode",
                    data: l
                }));
                return e.bindCheckCoverageEvents(a, t),
                a
            };
            l.ui.insertTemplate(t.container, function(n) {
                n(i(), function() {
                    a.find("#postal_code").focus(),
                    t.data && !t.data.hasOwnProperty("postalCode") && a.find(".app-content").toggleClass("step-0 step-1")
                })
            })
        },
        renderCoverageInfo: function(t) {
            var e = this
              , a = function(l, a) {
                var i = {
                    isActivating: e.appFlags.isActivating,
                    coverage: a,
                    address: l.formatted_address
                }
                  , o = n(e.getTemplate({
                    name: "coverage-info",
                    data: i
                }));
                return e.bindCoverageInfoEvents(o, t),
                o
            };
            l.ui.insertTemplate(t.container, function(n) {
                l.waterfall([function(n) {
                    e.requestGetAddressInfo({
                        data: {
                            postalCode: t.data.postalCode
                        },
                        success: function(t) {
                            n(null, t)
                        },
                        error: function() {
                            l.ui.toast({
                                type: "warning",
                                message: e.i18n.active().mobileApp.toastr.warning.invalidZipCode
                            }),
                            n(!0)
                        }
                    })
                }
                , function(n, a) {
                    e.requestCheckCoverage({
                        data: {
                            postalCode: t.data.postalCode
                        },
                        success: function(t) {
                            a(null, n, t)
                        },
                        error: function() {
                            l.ui.toast({
                                type: "warning",
                                message: e.i18n.active().mobileApp.toastr.warning.areaNotCovered
                            }),
                            a(!0)
                        }
                    })
                }
                ], function(l, i, o) {
                    l ? e.renderCheckCoverage(t) : n(a(i, o))
                })
            }, {
                title: e.i18n.active().mobileApp.loadingTitles.titles.checkingCoverage
            })
        },
        renderDeviceActivation: function(t) {
            var e = this
              , a = t.container
              , i = function(l) {
                var a = {
                    features: l.account.device_defaults.features,
                    isSimRequired: t.data.isSimRequired,
                    postalCode: t.hasOwnProperty("data") ? t.data.postalCode : void 0,
                    currentUserId: e.userId,
                    users: l.users,
                    voicemailBoxes: l.voicemailBoxes
                }
                  , i = n(e.getTemplate({
                    name: "activation-deviceActivation",
                    data: a
                }));
                return e.bindDeviceActivationEvents(i, n.extend(!0, {}, t, {
                    data: l
                })),
                i
            };
            l.ui.insertTemplate(a, function(n) {
                l.parallel({
                    account: function(t) {
                        e.requestTopGetAccount({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    mainUserCallflows: function(t) {
                        e.requestListCallflows({
                            data: {
                                filters: {
                                    filter_type: "mainUserCallflow"
                                }
                            },
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    users: function(t) {
                        e.requestListUsers({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    voicemailBoxes: function(t) {
                        e.requestListVoicemailBoxes({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    }
                }, function(l, o) {
                    l ? e.renderCoverageInfo(t) : n(i(o), function() {
                        var t = a.find("#postal_code")
                          , n = a.find("#name");
                        (t.val() ? n : t).focus(),
                        a.find(".app-content").toggleClass("step-1 step-2")
                    })
                })
            })
        },
        renderActivationSuccess: function(t) {
            var e = this
              , a = t.container
              , i = function(l) {
                var a = {
                    device: l,
                    postalCode: t.data.newDevice.postal_code
                }
                  , i = n(e.getTemplate({
                    name: "activation-success",
                    data: a
                }));
                return e.bindActivationSuccessEvents(i, t),
                i
            };
            l.ui.insertTemplate(t.container, function(l) {
                e.helperActivateDevice(n.extend(!0, t, {
                    success: function(t) {
                        l(i(t), function() {
                            a.find(".app-content").toggleClass("step-2 step-3")
                        })
                    },
                    error: function() {
                        e.renderDeviceActivation(t)
                    }
                }))
            },  {
                title: e.i18n.active().mobileApp.loadingTitles.titles.activatingDevice,
                text: e.i18n.active().mobileApp.loadingTitles.texts.activatingDevice
            })
	    
        },
        renderProvisioningModelsListing: function(t) {
            var e = this
              , a = function() {
                var l = n(e.getTemplate({
                    name: "provisioning-modelsListing"
                }));
                return e.bindProvisioningModelsListing(l, t),
                l
            };
            l.ui.insertTemplate(t.container, function(t) {
                t(a())
            })
        },
        renderProvisioningModelInstructions: function(t) {
            var e = this
              , a = function() {
                var l = {
                    comingFromActivationSuccess: t.data.comingFromActivationSuccess,
                    model: e.i18n.active().mobileApp.provisioning.categories[t.data.modelType]
                }
                  , a = n(e.getTemplate({
                    name: "provisioning-modelInstructions",
                    data: l
                }));
                return e.bindProvisioningModelInstructions(a, t),
                a
            };
            l.ui.insertTemplate(t.container, function(t) {
                t(a())
            })
        },
        renderAccountSettings: function(t) {
            var a = this
              , i = function(i) {
                var o = {
                    data: n.extend(!0, {}, i, {
                        data: {
                            blocking: {
                                cap: Math.round(i.data.blocking.cap / 1e6)
                            },
                            throttling: {
                                cap: Math.round(i.data.throttling.cap / 1e6)
                            }
                        },
                        device_defaults: {
                            features: i.device_defaults.features,
                            data: {
                                blocking: {
                                    cap: Math.round(i.device_defaults.data.blocking.cap / 1e6)
                                },
                                throttling: {
                                    cap: Math.round(i.device_defaults.data.blocking.cap / 1e6)
                                }
                            }
                        }
                    }),
                    rates: a.appFlags.rates,
                    unit: a.i18n.active().unitsMultiple.byte[2].symbol
                }
                  , r = n(a.getTemplate({
                    name: "accountSettings",
                    data: o
                }));
                return l.ui.tooltips(r),
                0 === i.data.blocking.cap && (r.find("#account_blocking_cap_group").hide(),
                r.find("#account_throttling_rate_group").hide()),
                0 === i.data.throttling.cap ? r.find("#account_throttling_rate_group").hide() : r.find("#account_throttling_cap").prop("checked", !0),
                l.ui.slider(r.find("#account_slider"), a.generateSliderSettings(i.data)),
                0 === i.device_defaults.data.blocking.cap && (r.find("#defaults_blocking_cap_group").hide(),
                r.find("#defaults_throttling_rate_group").hide()),
                0 === i.device_defaults.data.throttling.cap ? r.find("#defaults_throttling_rate_group").hide() : r.find("#defaults_throttling_cap").prop("checked", !0),
                l.ui.slider(r.find("#defaults_slider"), a.generateSliderSettings(i.device_defaults.data)),
                a.bindAccountSettingsEvents(r, e.assign({}, t, {
                    data: i.id
                })),
                r
            };
            l.ui.insertTemplate(t.container, function(t) {
                a.requestTopGetAccount({
                    success: function(n) {
                        t(i(n))
                    }
                })
            })
        },
        renderPortingList: function(t) {
            var a = this
              , i = function(i) {
                var o = function(t) {
                    var l = t.ports
                      , i = t.users.reduce(function(t, n) {
                        return t[n.id] = n,
                        t
                    }, {});
                    return e.each(l, function(t, e, l) {
                        var o, r;
                        i.hasOwnProperty(t.additional_properties.submitted_by) ? (r = i[t.additional_properties.submitted_by],
                        o = r.first_name + " " + r.last_name) : o = 0 === t.additional_properties.submitted_by ? a.i18n.active().mobileApp.misc.admin : a.i18n.active().mobileApp.misc.unknown,
                        l[e] = n.extend(!0, {}, t, {
                            additional_properties: {
                                submitted_by: o
                            }
                        })
                    }),
                    {
                        ports: l
                    }
                }(i)
                  , r = n(a.getTemplate({
                    name: "porting-list",
                    data: o
                }));
                return l.ui.footable(r.find("#porting_list"), {
                    filtering: {
                        enabled: !0
                    }
                }),
                a.bindPortingListEvents(r, e.extend(t, {
                    data: {}
                })),
                r
            };
            l.ui.insertTemplate(t.container, function(t) {
                l.parallel({
                    ports: function(t) {
                        a.requestTopListPorting({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    users: function(t) {
                        a.requestListUsers({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    }
                }, function(n, e) {
                    t(n ? i() : i(e))
                })
            })
        },
        renderPortingPrevalidate: function(t) {
            var e = this
              , a = t.container
              , i = function() {
                var l = n(e.getTemplate({
                    name: "porting-prevalidate"
                }));
                return e.bindPortingPrevalidateEvents(l, t),
                l
            };
            l.ui.insertTemplate(t.container, function(t) {
                t(i(), function() {
                    a.find("#mdn").focus()
                })
            })
        },
        renderPortingPrevalidateResponse: function(t) {
            var e = this
              , a = function(l) {
                var a = {
                    isValid: l.valid
                }
                  , i = n(e.getTemplate({
                    name: "porting-prevalidateResponse",
                    data: a
                }));
                return e.bindPortingPrevalidateResponseEvents(i, n.extend(!0, {}, t, {
                    data: {
                        newMdn: l.mdn
                    }
                })),
                i
            };
            l.ui.insertTemplate(t.container, function(n) {
                e.requestTopValidatePorting({
                    data: {
                        mdn: t.data.mdn
                    },
                    success: function(t) {
                        n(a(t))
                    },
                    error: function() {
                        n(a({}))
                    }
                })
            }, {
                title: e.i18n.active().mobileApp.loadingTitles.titles.validateNumber
            })
        },
        renderPortingWizard: function(t) {
            var e = this
              , a = function(l) {
                var a = {
                    porting: t.data.porting,
                    devices: l,
                    mdn: t.data.newMdn
                }
                  , i = n(e.getTemplate({
                    name: "porting-wizard",
                    data: a
                }));
                return t.data.hasOwnProperty("porting") ? t.data.porting.request_data.hasOwnProperty("ssn") ? i.find(".field-business").hide() : i.find(".field-personal").hide() : (i.find(".field-business").hide(),
                i.find("#selected_device_info").hide()),
                i.find("#tax_id").mask("999999999", {
                    placeholder: "123456789"
                }),
                i.find("#ssn").mask("9999", {
                    placeholder: "1234"
                }),
                e.bindPortingWizardEvents(i, t),
                i
            };
            l.ui.insertTemplate(t.container, function(n) {
                e.requestTopListDevices({
                    success: function(l) {
                        if (t.data.hasOwnProperty("porting")) {
                            l.hasOwnProperty(t.data.porting.request_data.device_id) || (l[t.data.porting.request_data.device_id] = {
                                id: t.data.porting.request_data.device_id,
                                name: "Unknown"
                            })
                        }
                        n(a(l), function() {
                            t.data.hasOwnProperty("porting") && e.renderPortingWizardDeviceSelector(t)
                        })
                    }
                })
            })
        },
        renderPortingWizardDeviceSelector: function(t) {
            var e = this
              , a = t.container
              , i = a.find("#device_id")
              , o = i.val();
            i.prop("disabled", !0).find('option[value=""]').remove(),
            e.requestTopGetDevice({
                data: {
                    deviceId: o
                },
                success: function(t) {
                    var e = a.find("#selected_device_info")
                      , o = a.find("#selected_device_mdn")
                      , r = a.find("#selected_device_manufacturer")
                      , s = a.find("#selected_device_model");
                    t ? e.is(":visible") ? (o.fadeOut(function() {
                        n(this).text(l.util.formatPhoneNumber(t.subscription.mdn)).fadeIn()
                    }),
                    r.fadeOut(function() {
                        n(this).text(t.model.manufacturer).fadeIn()
                    }),
                    s.fadeOut(function() {
                        n(this).text(t.model.name).fadeIn(function() {
                            i.prop("disabled", !1)
                        })
                    })) : (o.text(l.util.formatPhoneNumber(t.subscription.mdn)),
                    r.text(t.model.manufacturer),
                    s.text(t.model.name),
                    e.slideDown(function() {
                        i.prop("disabled", !1)
                    })) : (i.prop("disabled", !1),
                    e.slideUp())
                }
            })
        },
        renderPortingDetail: function(t) {
            var e = this
              , a = function(l) {
                var a = function(t) {
                    var l, a, i = t.porting, o = t.users.reduce(function(t, n) {
                        return t[n.id] = n,
                        t
                    }, {});
                    return o.hasOwnProperty(i.additional_properties.submitted_by) ? (a = o[i.additional_properties.submitted_by],
                    l = a.first_name + " " + a.last_name) : l = 0 === i.additional_properties.submitted_by ? e.i18n.active().mobileApp.misc.admin : e.i18n.active().mobileApp.misc.unknown,
                    {
                        porting: n.extend(!0, {}, i, {
                            additional_properties: {
                                submitted_by: l
                            }
                        }),
                        targetDevice: t.devices[t.porting.request_data.device_id]
                    }
                }(l)
                  , i = n(e.getTemplate({
                    name: "porting-detail",
                    data: a
                }));
                return e.bindPortingDetailEvents(i, n.extend(!0, {}, t, {
                    data: {
                        porting: l.porting,
                        extra: {
                            targetDevice: l.devices[l.porting.request_data.device_id]
                        }
                    }
                })),
                i
            };
            l.ui.insertTemplate(t.container, function(n) {
                l.parallel({
                    porting: function(n) {
                        e.requestTopGetPorting({
                            data: {
                                portId: t.data.id
                            },
                            success: function(t) {
                                n(null, t)
                            }
                        })
                    },
                    users: function(t) {
                        e.requestListUsers({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    },
                    devices: function(t) {
                        e.requestTopListDevices({
                            success: function(n) {
                                t(null, n)
                            }
                        })
                    }
                }, function(l, i) {
                    l ? e.renderPortingList(t) : n(a(i))
                })
            }, {
                title: e.i18n.active().mobileApp.loadingTitles.titles.searchingRequest
            })
        },
        bindDevicesListEvents: function(t, e) {
            var a = this;
            t.find(".activate-device").on("click", function(t) {
                t.preventDefault(),
                a.renderEsnCheck(e)
            }),
            t.find(".download-csv").on("click", function(t) {
                t.preventDefault(),
                a.requestTopGetAccountUsageAsCsv({
                    success: function() {
                        window.open(a.apiUrl + "accounts/" + a.accountId + "/usage/csv?auth_token=" + a.getAuthToken())
                    },
                    error: function() {
                        l.ui.toast({
                            type: "warning",
                            message: a.i18n.active().mobileApp.toastr.warning.noUsageData
                        })
                    }
                })
            }),
            t.find("#devices_list").on("click", ".edit-device", function(t) {
                t.preventDefault();
                var l = n(this)
                  , i = l.parents("tr").data("id");
		    
                a.renderDeviceInfo(n.extend(!0, {}, e, {
                    data: {
				deviceId: i
                    }
                }));

            }),
            t.find("#devices_list").on("click", ".cancel-device", function(i) {
                i.preventDefault();
                var o = n(this)
                  , r = o.parents("tr").data("mdn")
                  , s = o.parents("tr").data("id");
                l.ui.confirm(a.i18n.active().mobileApp.confirmPopup.deleteDevice.text, function() {
                    a.helperDesactivateDevice({
                        data: {
                            mdn: r,
                            deviceId: s
                        },
                        success: function() {
                            1 === t.find("tbody").children().length ? a.renderDevicesList(e) : o.parents("tr").fadeOut(function() {
                                n(this).remove()
                            })
                        }
                    })
                }, function() {}, {
                    title: a.i18n.active().mobileApp.confirmPopup.deleteDevice.title + e.data.devices[s].name,
                    confirmButtonText: a.i18n.active().mobileApp.confirmPopup.deleteDevice.confirmButton,
                    confirmButtonClass: "monster-button-danger"
                })
            })
        },
        bindDeviceInfoEvents: function(t, a) {
            var i = this;
            t.find(".navbar-menu-item-link").on("click", function(e) {
                e.preventDefault();
                var l = n(this).data("tab");
                t.find(".navbar-menu-item-link.active").removeClass("active"),
                n(this).addClass("active"),
                t.find(".info-content-wrapper.active").fadeOut(function() {
                    n(this).removeClass("active"),
                    t.find('.info-content-wrapper[data-tab="' + l + '"]').fadeIn(function() {
                        n(this).addClass("active")
                    })
                }),
                "info" === l ? t.find("#edit_device_name").fadeIn() : t.find("#edit_device_name").fadeOut()
            }),
            t.on("click", ".edit", function(t) {
                t.preventDefault();
                var e = n(this)
                  , l = e.siblings(".device-name-text")
                  , a = e.siblings(".device-name-input");
                l.fadeOut(function() {
                    a.fadeIn(function() {
                        a.focus()
                    })
                }),
                n(this).fadeOut()
            }),
            t.on("keypress", ".device-name-input", function(e) {
                if (!e.hasOwnProperty("keyCode") || 13 === e.keyCode) {
                    var o = n(this)
                      , r = o.siblings(".device-name-text")
                      , s = o.siblings(".edit")
                      , c = t.find(".device-name-input").val()
                      , u = [function(t) {
                        i.requestTopPatchDevice({
                            data: {
                                deviceId: a.data.deviceId,
                                data: {
                                    name: c
                                }
                            },
                            success: function() {
                                t(null)
                            }
                        })
                    }
                    ];
                    a.data.deviceInfo.name !== c && (a.data.reconcile.hasOwnProperty("device") && u.push(function(t) {
                        i.requestKazooPatchDevice({
                            data: {
                                deviceId: a.data.reconcile.device.id,
                                data: {
                                    name: c
                                }
                            },
                            success: function() {
                                t(null)
                            }
                        })
                    }),
                    l.parallel(u)),
                    o.fadeOut(function() {
                        "info" === t.find(".navbar-menu-item-link.active").data("tab") && s.fadeIn(),
                        r.fadeIn()
                    }),
                    r.text(o.val())
                }
            }),
            t.on("blur", ".device-name-input", function(e) {
                var l = n(this)
                  , a = l.siblings(".device-name-text")
                  , i = l.siblings(".edit");
                l.fadeOut(function() {
                    "info" === t.find(".navbar-menu-item-link.active").data("tab") && i.fadeIn(),
                    l.val(a.text()),
                    a.fadeIn()
                })
            }),
            t.find(".repair").on("click", function(t) {
                t.preventDefault(),
                i.reconcileMobileRelatedEntities(n.extend(!0, a, {
                    callback: function() {
                        i.renderDeviceInfo(a)
                    }
                }))
            }),
            t.find(".suspend").on("click", function(t) {
                t.preventDefault(),
                l.ui.confirm(i.i18n.active().mobileApp.deviceInfo.confirm.suspension.suspend.text, function() {
                    i.requestTopSuspendDevice({
                        data: {
                            deviceId: a.data.deviceId
                        },
                        success: function() {
                            i.renderDeviceInfo(a)
                        }
                    })
                }, function() {}, {
                    title: i.i18n.active().mobileApp.deviceInfo.confirm.suspension.title,
                    confirmButtonText: i.i18n.active().mobileApp.deviceInfo.confirm.suspension.suspend.ok,
                    confirmButtonClass: "monster-button-warning"
                })
            }),
            t.find(".restore").on("click", function(t) {
                t.preventDefault(),
                l.ui.confirm(i.i18n.active().mobileApp.deviceInfo.confirm.suspension.restore.text, function() {
                    i.requestTopRestoreDevice({
                        data: {
                            deviceId: a.data.deviceId
                        },
                        success: function() {
                            i.renderDeviceInfo(a)
                        }
                    })
                }, function() {}, {
                    title: i.i18n.active().mobileApp.deviceInfo.confirm.suspension.title,
                    confirmButtonText: i.i18n.active().mobileApp.deviceInfo.confirm.suspension.restore.ok,
                    confirmButtonClass: "monster-button-success"
                })
            }),
            t.find(".back").on("click", function(t) {
                t.preventDefault(),
                i.renderDevicesList(a)
            }),
            t.find("#device_limit_data").on("change", function(e) {
                e.preventDefault();
                var a = n(this);
                a.prop("checked") ? t.find("#device_limit_data_group").slideDown() : (t.find("#device_limit_data_group").slideUp(),
                l.ui.confirm(i.i18n.active().mobileApp.deviceLimits.limits.limitDeviceData.confirm.text, function() {
                    t.find("#device_limit_data_group").slideUp()
                }, function() {
                    a.prop("checked", !0),
                    t.find("#device_limit_data_group").slideDown()
                }, {
                    title: i.i18n.active().mobileApp.deviceLimits.limits.limitDeviceData.confirm.title,
                    confirmButtonText: i.i18n.active().mobileApp.deviceLimits.limits.limitDeviceData.confirm.confirmButton
                }))
            }),
            t.find("#device_blocking_cap").on("keyup", function(n) {
                n.preventDefault();
                var e = 100 * Math.round(n.target.value / 100)
                  , l = t.find("#device_slider .monster-slider")
                  , a = l.slider("option", "max")
                  , i = l.slider("option", "value")
                  , o = 100 * i / a
                  , r = 100 * Math.round(e * o / 100 / 100);
                e > 0 ? (l.slider("option", "max", e).slider("option", "value", r >= 100 ? r : 100),
                l.find(".ui-slider-limit.max .limit-value").text(e),
                l.find(".ui-slider-handle.max .tooltip-value").text(r),
                t.find("#device_throttling_cap").prop("checked") ? t.find("#device_throttling_rate_group").show() : t.find("#device_throttling_rate_group").hide(),
                t.find("#device_blocking_cap_group").slideDown()) : t.find("#device_blocking_cap_group").slideUp()
            }),
            t.find("#device_throttling_cap").on("change", function(e) {
                e.preventDefault(),
                n(this).prop("checked") ? t.find("#device_throttling_rate_group").slideDown() : t.find("#device_throttling_rate_group").slideUp()
            }),
            t.find(".cancel").on("click", function(t) {
                t.preventDefault(),
                i.renderDevicesList(a)
            }),
            t.find(".save").on("click", function(e) {
                e.preventDefault();
                var o = t.find("#device_limits_form")
                  , r = l.ui.getFormData("device_limits_form")
                  , s = t.find("#device_slider .monster-slider");
                l.ui.validate(o, {
                    rules: {
                        "device.data.blocking.cap": {
                            required: r.limit_data,
                            digits: !0,
                            min: 50
                        }
                    }
                }),
                l.ui.valid(o) && (r.limit_data ? n.extend(!0, r, {
                    device: {
                        data: {
                            blocking: {
                                cap: r.device.data.blocking.cap ? 1e6 * s.slider("option", "max") : 0
                            }
                        }
                    }
                }) : n.extend(!0, r, {
                    device: {
                        data: {
                            blocking: {
                                cap: 0
                            }
                        }
                    }
                }),
                r.device.data.throttling.cap ? r.device.data.throttling.cap = 1e6 * s.slider("option", "value") : r.device.data.throttling.cap = 0,
                i.requestTopPatchDevice({
                    data: {
                        deviceId: a.data.deviceId,
                        data: r.device
                    },
                    success: function() {
                        i.renderDeviceInfo(a)
                    }
                }))
            }),
            t.find("#external").on("change", function(e) {
                e.preventDefault(),
                n(this).prop("checked") ? t.find(".cluster-settings").slideDown() : t.find(".cluster-settings").slideUp()
            }),
            t.find(".save-routing").on("click", function(e) {
                e.preventDefault();
                var o = n(this)
                  , r = t.find("#form_offnet_routing")
                  , s = l.ui.getFormData("form_offnet_routing")
                  , c = {
                    required: !0,
                    minlength: 3,
                    maxlength: 128
                };
                l.ui.validate(r, {
                    rules: {
                        "voice.sip.realm": c,
                        "voice.sip.username": c,
                        "voice.sip.password": c,
                        "voice.cluster_id": c
                    }
                }),
                l.ui.valid(r) && (o.prop("disabled", !0),
                i.helperSaveOffnetRouting(a, s))
            }),
            t.find(".delete-routing").on("click", function(t) {
                t.preventDefault(),
                n(this).prop("disabled", !0),
                i.helperDeleteOffnetRouting(a)
            }),
            t.find(".replace-device").on("click", function(o) {
                o.preventDefault();
                var r = n(this)
                  , s = t.find("#form_replace_device")
                  , c = l.ui.getFormData("form_replace_device");
                l.ui.validate(s, {
                    rules: {
                        device_id: {
                            hexadecimal: !0,
                            minlength: 8,
                            maxlength: 18
                        },
                        sim_id: {
                            digits: !0
                        }
                    }
                }),
                l.ui.valid(s) && (r.prop("disabled", !0),
                i.helperReplaceDevice(e.merge({}, a, {
                    error: function() {
                        r.prop("disabled", !1)
                    }
                }), c))
            }),
            t.find(".save-features").on("click", function(t) {
                t.preventDefault();
                var o = l.ui.getFormData("form_device_features")
                  , r = a.data.deviceInfo.subscription.features
                  , s = {
                    add: [],
                    remove: []
                };
                o.hasOwnProperty("features") || (o.features = []),
                e.includes(o.features, "tethering") ? e.includes(r, "tethering") || s.add.push("tethering") : e.includes(r, "tethering") && s.remove.push("tethering"),
                e.includes(o.features, "mms") ? e.includes(r, "mms") || (s.add.push("mms"),
                e.includes(r, "sms_blocking") && s.remove.push("sms_blocking")) : e.includes(r, "mms") && (s.remove.push("mms"),
                e.includes(r, "sms_blocking") || s.add.push("sms_blocking")),
                e.isEmpty(s.add) && e.isEmpty(s.remove) ? l.ui.toast({
                    type: "info",
                    message: i.i18n.active().mobileApp.toastr.info.updateFeature
                }) : (n(this).prop("disabled", !0),
                i.requestTopUpdateDeviceSubscription({
                    data: {
                        deviceId: a.data.deviceId,
                        data: {
                            features: s
                        }
                    },
                    success: function(t) {
                        i.renderDeviceInfo(a)
                    }
                }))
            })
        },
        bindEsnCheckEvents: function(t, e) {
            var a = this;
            t.find(".action-button").on("click", function(i) {
                i.preventDefault();
                var o = t.find("#esn_check_form");
                l.ui.validate(o, {
                    rules: {
                        esn: {
                            required: !0,
                            hexadecimal: !0,
                            minlength: 8,
                            maxlength: 18
                        }
                    }
                }),
                l.ui.valid(o) && a.renderDeviceValidation(n.extend(!0, e, {
                    data: {
                        esn: l.ui.getFormData("esn_check_form").esn
                    }
                }))
            })
        },
        bindDeviceValidationEvents: function(t, n) {
            var e = this;
            t.find(".cancel").on("click", function(t) {
                t.preventDefault(),
                e.appFlags.isActivating = !1,
                e.renderEsnCheck(n)
            }),
            t.find(".check-coverage").on("click", function(t) {
                t.preventDefault(),
                e.renderCheckCoverage(n)
            }),
            t.find(".activate-device").on("click", function(t) {
                t.preventDefault(),
                e.renderDeviceActivation(n)
            })
        },
        bindCheckCoverageEvents: function(t, e) {
            var a = this;
            t.find(".check-coverage").on("click", function(i) {
                i.preventDefault();
                var o = t.find("#check_coverage_form");
                l.ui.validate(o, {
                    rules: {
                        postal_code: {
                            required: !0,
                            digits: !0,
                            minlength: 5,
                            maxlength: 5
                        }
                    }
                }),
                l.ui.valid(o) && a.renderCoverageInfo(n.extend(!0, e, {
                    data: {
                        postalCode: l.ui.getFormData("check_coverage_form").postal_code
                    }
                }))
            })
        },
        bindCoverageInfoEvents: function(t, n) {
            var e = this;
            t.find(".check-zipCode").on("click", function(t) {
                t.preventDefault(),
                e.renderCheckCoverage(n)
            }),
            t.find(".activate").on("click", function(t) {
                t.preventDefault(),
                e.renderDeviceActivation(n)
            })
        },
        bindDeviceActivationEvents: function(t, a) {
            var i = this
              , o = e.map(a.data.mainUserCallflows, function(t) {
                return t.owner_id
            });
            l.ui.chosen(t.find("#user_id")),
            t.find("#is_smartpbx_user").on("change", function(n) {
                var e = t.find("#user_id_container")
                  , l = t.find("#voicemail_box_container");
                n.target.checked ? (o.indexOf(t.find("#user_id").val()) < 0 ? l.slideDown() : l.slideUp(),
                e.slideDown()) : (t.find("#has_voicemail_box").is(":checked") && t.find("#has_voicemail_box").click(),
                t.find("#user_id").val(i.userId).trigger("chosen:updated"),
                l.slideUp(),
                e.slideUp())
            }),
            t.find("#user_id").on("change", function(n) {
                var l = t.find("#voicemail_box_container");
                if (o.indexOf(n.target.value) < 0) {
                    var i = e.find(a.data.voicemailBoxes, function(n) {
                        return n.owner_id === t.find("#user_id").val()
                    });
                    void 0 !== i && t.find("#voicemail_box_id").val(i.id).trigger("chosen:update"),
                    l.slideDown()
                } else
                    t.find("#has_voicemail_box").is(":checked") && t.find("#has_voicemail_box").click(),
                    l.slideUp()
            }),
            t.find("#has_voicemail_box").on("change", function(n) {
                var l = t.find("#voicemail_box_id_container");
                if (n.target.checked) {
                    var i = e.find(a.data.voicemailBoxes, function(n) {
                        return n.owner_id === t.find("#user_id").val()
                    });
                    void 0 !== i && t.find("#voicemail_box_id").val(i.id).trigger("chosen:updated"),
                    l.slideDown()
                } else
                    l.slideUp()
            }),
            t.find(".activate-device").on("click", function(e) {
                e.preventDefault();
                var o = t.find("#activation_form");
                if (l.ui.validate(o, {
                    rules: {
                        "device.sim": {
                            required: !0,
                            digits: !0
                        },
                        "device.postal_code": {
                            required: !0,
                            digits: !0,
                            minlength: 5,
                            maxlength: 5
                        },
                        "device.name": {
                            required: !0,
                            minlength: 3,
                            maxlength: 128
                        },
			// --- AGREGAR VALIDACIÓN MDN ---
        "device.subscription.mdn": {
            required: !0,
            digits: !1,
            minlength: 10,
            maxlength: 15
        },
        "device.subscription.esn": {
            required: !0,
            digits: !0,
            minlength: 12,
            maxlength: 15
        }
                    }
                }),
                l.ui.valid(o)) {
                    var r = l.ui.getFormData("activation_form")
                      , s = {
                        newDevice: r.device
                    };
                    r.is_smartpbx_user && (s.userId = r.user_id),
                    r.has_voicemail_box && (s.voicemail_box_id = r.voicemail_box_id),
                    i.renderActivationSuccess(n.extend(!0, a, {
                        data: s
                    }))
                }
            })
        },
        bindActivationSuccessEvents: function(t, e) {
            var l = this;
            t.find(".provision-device").on("click", function(t) {
                t.preventDefault(),
                l.renderProvisioningModelsListing(n.extend(!0, {}, e, {
                    data: {
                        comingFromActivationSuccess: !0
                    }
                }))
            })
        },
        bindProvisioningModelsListing: function(t, e) {
            var l = this;
            t.find(".model-type").on("click", function(t) {
                t.preventDefault();
                var a = n(this)
                  , i = a.data("model");
                l.renderProvisioningModelInstructions(n.extend(!0, e, {
                    data: {
                        modelType: i
                    }
                }))
            })
        },
        bindProvisioningModelInstructions: function(t, n) {
            var e = this;
            t.find(".device-categories").on("click", function(t) {
                t.preventDefault(),
                e.renderProvisioningModelsListing(n)
            }),
            t.find(".done").on("click", function(t) {
                t.preventDefault(),
                e.appFlags.isActivating = !1,
                l.ui.loadTab(e, "devices")
            })
        },
        bindPortingListEvents: function(t, e) {
            var l = this;
            t.find(".new-port").on("click", function(t) {
                t.preventDefault(),
                l.renderPortingPrevalidate(e)
            }),
            t.find(".detail").on("click", function(t) {
                t.preventDefault();
                var a = n(this).parents("tr").data("id");
                l.renderPortingDetail(n.extend(!0, e, {
                    data: {
                        id: a
                    }
                }))
            })
        },
        bindPortingPrevalidateEvents: function(t, e) {
            var a = this;
            t.find(".action-button").on("click", function(i) {
                i.preventDefault();
                var o = t.find("#prevalidate_form");
                l.ui.validate(o, {
                    rules: {
                        mdn: {
                            required: !0,
                            digits: !0,
                            maxlength: 10
                        }
                    }
                }),
                l.ui.valid(o) && a.renderPortingPrevalidateResponse(n.extend(!0, e, {
                    data: {
                        mdn: l.ui.getFormData("prevalidate_form").mdn
                    }
                }))
            })
        },
        bindPortingPrevalidateResponseEvents: function(t, n) {
            var e = this;
            t.find("#start_port").on("click", function(t) {
                t.preventDefault(),
                e.renderPortingWizard(n)
            }),
            t.find("#back").on("click", function(t) {
                t.preventDefault(),
                e.renderPortingPrevalidate(n)
            })
        },
        bindPortingWizardEvents: function(t, e) {
            var a = this;
            t.find("#device_id").on("change", function(t) {
                t.preventDefault(),
                a.renderPortingWizardDeviceSelector(e)
            }),
            t.find(".account-type").on("change", function(e) {
                e.preventDefault();
                var l = n(this);
                l.prop("disabled", !0),
                "personal" === e.target.value ? t.find(".field-business").fadeOut(function() {
                    t.find(".field-personal").fadeIn(function() {
                        l.prop("disabled", !1)
                    })
                }) : t.find(".field-personal").fadeOut(function() {
                    t.find(".field-business").fadeIn(function() {
                        l.prop("disabled", !1)
                    })
                })
            }),
            t.find("#postal_code").on("blur", function(e) {
                e.preventDefault();
                var l = n(this);
                if (l.val()) {
                    var i = t.find("#city")
                      , o = t.find("#state");
                    i.prop("disabled", !0),
                    o.prop("disabled", !0),
                    a.requestGetAddressInfo({
                        data: {
                            postalCode: l.val()
                        },
                        success: function(t) {
                            i.val(t.address_components[1].long_name).prop("disabled", !1),
                            o.val(t.address_components[t.address_components.length - 2].short_name).prop("disabled", !1)
                        },
                        error: function() {
                            i.val("").prop("disabled", !1),
                            o.val("").prop("disabled", !1)
                        }
                    })
                }
            }),
            t.find("#cancel").on("click", function(t) {
                t.preventDefault(),
                a.renderPortingPrevalidate(e)
            }),
            t.find("#save").on("click", function(i) {
                i.preventDefault();
                var o = t.find("#port_wizard_form")
                  , r = l.ui.getFormData("port_wizard_form")
                  , s = {
                    "global.device_id": {
                        required: !0
                    },
                    type: {
                        required: !0
                    },
                    "global.current_carrier.account_id": {
                        required: !0,
                        maxlength: 20
                    },
                    "global.current_carrier.password": {
                        required: !0,
                        maxlength: 18
                    },
                    "global.current_carrier.subscriber_full_name": {
                        required: !0,
                        maxlength: 30
                    },
                    "global.address.street": {
                        required: !0,
                        maxlength: 60
                    },
                    "global.address.street_number": {
                        required: !0,
                        maxlength: 10
                    },
                    "global.address.locality": {
                        required: !0,
                        maxlength: 35
                    },
                    "global.address.postal_code": {
                        required: !0,
                        digits: !0,
                        maxlength: 5
                    },
                    "global.address.region": {
                        required: !0,
                        minlength: 2,
                        maxlength: 2
                    },
                    "personal.ssn": {
                        required: !0,
                        digits: !0,
                        minlength: 4,
                        maxlength: 4
                    },
                    "personal.first_name": {
                        required: !0,
                        maxlength: 25
                    },
                    "personal.last_name": {
                        required: !0,
                        maxlength: 25
                    },
                    "business.business_name": {
                        required: !0,
                        maxlength: 60
                    },
                    "business.tax_id": {
                        required: !0,
                        digits: !0,
                        minlength: 9,
                        maxlength: 10
                    }
                };
                l.ui.validate(o, {
                    rules: s
                }),
                l.ui.valid(o) && (n.extend(!0, r.global, r[r.type], {
                    current_carrier: {
                        mdn: e.data.newMdn
                    }
                }),
                a.helperSavePorting(n.extend(!0, {}, e, {
                    data: r.global
                })))
            })
        },
        bindPortingDetailEvents: function(t, e) {
            var a = this;
            t.find("#edit").on("click", function(t) {
                t.preventDefault();
                var i = n(a.getTemplate({
                    name: "porting-detail-confirm",
                    data: e.data.porting
                }));
                l.ui.confirm(i, function() {
                    a.renderPortingWizard(e)
                }, function() {
                    a.requestTopDeletePorting({
                        data: {
                            portId: e.data.porting.id
                        },
                        success: function() {
                            a.renderPortingList(e)
                        }
                    })
                }, {
                    type: "warning",
                    title: a.i18n.active().mobileApp.porting.detail.confirm.title,
                    cancelButtonText: a.i18n.active().mobileApp.porting.detail.confirm.buttons.cancel,
                    confirmButtonText: a.i18n.active().mobileApp.porting.detail.confirm.buttons.ok,
                    cancelButtonClass: "monster-button-danger",
                    htmlContent: !0
                })
            })
        },
        bindAccountSettingsEvents: function(t, a) {
            var i = this
              , o = a.data;
            t.find("#account_blocking_cap").on("keyup", function(n) {
                n.preventDefault();
                var e = 100 * Math.round(n.target.value / 100)
                  , l = t.find("#account_slider .monster-slider")
                  , a = l.slider("option", "max")
                  , i = l.slider("option", "value")
                  , o = 100 * i / a
                  , r = 100 * Math.round(e * o / 100 / 100);
                e > 0 ? (l.slider("option", "max", e).slider("option", "value", r >= 100 ? r : 100),
                l.find(".ui-slider-limit.max .limit-value").text(e),
                l.find(".ui-slider-handle.max .tooltip-value").text(r),
                t.find("#account_throttling_cap").prop("checked") ? t.find("#account_throttling_rate_group").show() : t.find("#account_throttling_rate_group").hide(),
                t.find("#account_blocking_cap_group").slideDown()) : t.find("#account_blocking_cap_group").slideUp()
            }),
            t.find("#account_throttling_cap").on("change", function(e) {
                e.preventDefault(),
                n(this).prop("checked") ? t.find("#account_throttling_rate_group").slideDown() : t.find("#account_throttling_rate_group").slideUp()
            }),
            t.find("#defaults_blocking_cap").on("keyup", function(n) {
                n.preventDefault();
                var e = 100 * Math.round(n.target.value / 100)
                  , l = t.find("#defaults_slider .monster-slider")
                  , a = l.slider("option", "max")
                  , i = l.slider("option", "value")
                  , o = 100 * i / a
                  , r = 100 * Math.round(e * o / 100 / 100);
                e > 0 ? (l.slider("option", "max", e).slider("option", "value", r >= 100 ? r : 100),
                l.find(".ui-slider-limit.max .limit-value").text(e),
                l.find(".ui-slider-handle.max .tooltip-value").text(r),
                t.find("#defaults_throttling_cap").prop("checked") ? t.find("#defaults_throttling_rate_group").show() : t.find("#defaults_throttling_rate_group").hide(),
                t.find("#defaults_blocking_cap_group").slideDown()) : t.find("#defaults_blocking_cap_group").slideUp()
            }),
            t.find("#defaults_throttling_cap").on("change", function(e) {
                e.preventDefault(),
                n(this).prop("checked") ? t.find("#defaults_throttling_rate_group").show() : t.find("#defaults_throttling_rate_group").hide()
            }),
            t.find("#cancel").on("click", function(t) {
                t.preventDefault(),
                i.renderAccountSettings(a)
            }),
            t.find("#save").on("click", function(r) {
                r.preventDefault();
                var s = t.find("#account_settings_form")
                  , c = l.ui.getFormData("account_settings_form")
                  , u = t.find("#account_slider .monster-slider")
                  , d = t.find("#defaults_slider .monster-slider");
                l.ui.validate(s, {
                    rules: {
                        "data.blocking.cap": {
                            required: !0,
                            digits: !0
                        },
                        "device_defaults.data.blocking.cap": {
                            required: !0,
                            digits: !0
                        }
                    }
                }),
                l.ui.valid(s) && (n(this).prop("disabled", !0),
                n.extend(!0, c, {
                    data: {
                        blocking: {
                            cap: parseInt(c.data.blocking.cap, 10) ? 1e6 * u.slider("option", "max") : 0
                        }
                    },
                    device_defaults: {
                        features: [],
                        data: {
                            blocking: {
                                cap: parseInt(c.device_defaults.data.blocking.cap, 10) ? 1e6 * d.slider("option", "max") : 0
                            }
                        }
                    }
                }),
                e.includes(c.device_defaults.features, "mms") || c.device_defaults.features.push("sms_blocking"),
                c.data.throttling.cap ? c.data.throttling.cap = 1e6 * u.slider("option", "value") : c.data.throttling.cap = 0,
                c.device_defaults.data.throttling.cap ? c.device_defaults.data.throttling.cap = 1e6 * d.slider("option", "value") : c.device_defaults.data.throttling.cap = 0,
                i.helperSaveTopAccount(e.assign({}, a, {
                    data: {
                        accountId: o,
                        formData: c
                    }
                })))
            })
        },
        helperReplaceDevice: function(t, n) {
            var e = this
              , a = [function(l) {
                e.requestTopReplaceDevice({
                    data: {
                        deviceId: t.data.deviceId,
                        data: {
                            esn: n.device_id,
//                            esn: n.device_id,
                            sim: n.sim_id
                        }
                    },
                    success: function(t) {
                        l(null, t)
                    },
                    error: function() {
                        t.hasOwnProperty("error") && t.error()
                    }
                })
            }
            ];
            t.data.reconcile.hasOwnProperty("device") && a.push(function(n, l) {
                e.requestKazooPatchDevice({
                    data: {
                        deviceId: t.data.reconcile.device.id,
                        data: {
                            mobile: {
                                id: n.id
                            }
                        }
                    },
                    success: function() {
                        l(null)
                    },
                    error: function() {
                        t.hasOwnProperty("error") && t.error()
                    }
                })
            }),
            l.waterfall(a, function(n, l) {
                e.renderDevicesList(t)
            })
        },
        helperSaveOffnetRouting: function(t, n) {
            var a = this
              , i = e.extend({}, t.data.deviceInfo)
              , o = t.data.reconcile;
            e.isEmpty(n.voice.cluster_id) || !n.external ? (delete n.voice.cluster_id,
            n.voice.dns = !0) : delete n.voice.dns,
            l.parallel([function(t) {
                a.requestTopPatchDevice({
                    data: {
                        deviceId: i.id,
                        data: {
                            voice: n.voice
                        }
                    },
                    success: function() {
                        t(null)
                    }
                })
            }
            , function(t) {
                l.series([function(t) {
                    o.hasOwnProperty("device") ? a.requestKazooDeleteDevice({
                        data: {
                            deviceId: o.device.id
                        },
                        success: function() {
                            t(null)
                        }
                    }) : t(null)
                }
                , function(t) {
                    o.hasOwnProperty("callflow") ? a.requestDeleteCallflow({
                        data: {
                            callflowId: o.callflow.id
                        },
                        success: function() {
                            t(null)
                        }
                    }) : t(null)
                }
                ], function(n, e) {
                    t(null)
                })
            }
            ], function(n, e) {
                a.renderDeviceInfo(t)
            })
        },
        helperDeleteOffnetRouting: function(t) {
            var a = this;
            e.extend(t.data.deviceInfo, {
                voice: {
                    sip: {
                        realm: l.apps.auth.currentAccount.realm,
                        username: "user_" + l.util.randomString(6),
                        password: l.util.randomString(12)
                    }
                }
            }),
            l.parallel([function(n) {
                a.requestTopPatchDevice({
                    data: {
                        deviceId: t.data.deviceInfo.id,
                        data: t.data.deviceInfo
                    },
                    success: function() {
                        n(null)
                    }
                })
            }
            , function(e) {
                a.reconcileMobileRelatedEntities(n.extend(!0, t, {
                    callback: function() {
                        e(null)
                    }
                }))
            }
            ], function(n, e) {
                a.renderDeviceInfo(t)
            })
        },
        helperSavePorting: function(t) {
            var e = this;
            l.ui.insertTemplate(t.container, function(a) {
                n.extend(!0, t, {
                    data: {
                        additional_properties: {
                            submitted_by: l.util.isMasquerading() ? 0 : l.apps.auth.currentUser.id
                        }
                    }
                }),
                t.data.hasOwnProperty("id") ? e.requestTopUpdatePorting({
                    data: {
                        portId: t.data.id,
                        data: t.data
                    },
                    success: function() {
                        e.renderPortingList(t)
                    },
                    error: function() {
                        e.renderPortingList(t)
                    }
                }) : e.requestTopCreatePorting({
                    data: {
                        data: t.data
                    },
                    success: function() {
                        e.renderPortingList(t)
                    },
                    error: function() {
                        e.renderPortingList(t)
                    }
                })
            }, {
                title: e.i18n.active().mobileApp.loadingTitles.titles.submittingRequest
            })
        },
        generateCallflowData: function(t) {
            var l = t.voicemailBoxId
              , a = t.kazooDevice
              , i = a.owner_id
              , o = {
                mdn: t.topDevice.subscription.mdn
            };
            if (i) {
                var r = e.find(t.mainUserCallflows, function(t, n) {
                    return t.owner_id === i
                });
                if (r)
                    n.extend(!0, o, {
                        userId: i,
                        callflowId: r.id
                    });
                else {
                    var s = {
                        userId: i,
                        deviceId: a.id
                    };
                    l && (s.voicemailBoxId = l),
                    n.extend(!0, o, s)
                }
            } else
                o.deviceId = a.id;
            return o
        },
        helperActivateDevice: function(t) {
		/*
		console.log("requestKazooCreateDevice neutralizada: Omitiendo petición API.");
		if (t && typeof t.success === "function") {
        t.success({
            data: {
                id: (t.data && t.data.data && t.data.data.id) || "MOCK_DEVICE_ID"
            }
        });
    }
		*/
            var e = this
              , a = t.data.userId;
	var esnUpper = (t.data.esn || "").toUpperCase();
	    // --- AGREGAR ESTA LÓGICA DE TRANSFORMACIÓN ---
    if (t.data && t.data.newDevice) {
        // Si mdn viene en la raíz de newDevice o dentro de subscription
        var mdnVal = t.data.newDevice.mdn || 
                     (t.data.newDevice.subscription && t.data.newDevice.subscription.mdn) || 
                     "";
        var esnVal = t.data.newDevice.esn || 
                     (t.data.newDevice.subscription && t.data.newDevice.subscription.esn) || 
                     "";
        // Formatear correctamente el sub-objeto subscription que exige Kazoo
        t.data.newDevice.subscription = {
            mdn: mdnVal,
            esn: esnVal
        };
        t.data.newDevice.mobile = {
            mdn: mdnVal
        };

        // Eliminar la clave plana si existía para limpiar el payload
        delete t.data.newDevice.mdn;
        delete t.data.newDevice.esn;
    }
    // ----------------------------------------------
            l.waterfall([function(l) {
                e.requestTopActivateDevice({
                    data: {
                        data: n.extend(!0, t.data.newDevice, {
                            esn: esnUpper,
			    id: esnUpper
                        })
                    },
                    success: function(t) {
			t.esn = esnUpper;
                if (t.subscription) {
                    t.subscription.esn = esnUpper;
                }
                        l(null, t)
                    },
                    error: function() {
                        l(!0)
                    }
                })
            }
            , function(t, n) {
                e.requestKazooCreateDevice({
                    data: {
                        data: {
                            name: t.name,
                            mobile: {
                                id: t.id,
                                mdn: t.subscription.mdn
                            },
                            sip: {
                                username: t.voice.sip.username,
                                password: t.voice.sip.password
                            },
                            owner_id: a
                        }
                    },
                    success: function(e) {
                        n(null, t, e)
                    },
                    error: function() {
                        n(!0)
                    }
                })
            }
            , function(n, l, a) {
                e.requestCreateCallflow({
                    data: e.generateCallflowData({
                        topDevice: n,
                        kazooDevice: l,
                        mainUserCallflows: t.data.mainUserCallflows,
                        voicemailBoxId: t.data.voicemail_box_id
                    }),
                    success: function() {
                        a(null, n)
                    },
                    error: function() {
                        a(!0)
                    }
                })
            }
            ], function(n, l) {
                n ? e.renderDeviceActivation(t) : t.hasOwnProperty("success") && t.success(l)
            })
	    
        },
        helperDesactivateDevice: function(t) {
            var n = this;
            l.series([function(e) {
                n.requestTopDesactivateDevice({
                    data: {
                        deviceId: t.data.deviceId
                    },
                    success: function() {
                        e(null)
                    }
                })
            }
            , function(e) {
                l.parallel({
                    deleteMobileCallflows: function(e) {
                        l.waterfall([function(e) {
                            n.requestSearchCallflowsByNumbers({
                                data: {
                                    filters: {
                                        filter_type: "mobile"
                                    },
                                    value: t.data.mdn
                                },
                                success: function(t) {
                                    e(null, t[0])
                                }
                            })
                        }
                        , function(t, e) {
                            t ? n.requestDeleteCallflow({
                                data: {
                                    callflowId: t.id
                                },
                                success: function() {
                                    e(null)
                                }
                            }) : e(null)
                        }
                        ], function(t, n) {
                            e(null)
                        })
                    },
                    deleteKazooDevice: function(e) {
                        l.waterfall([function(e) {
                            n.requestKazooListDevices({
                                data: {
                                    filters: {
                                        "filter_mobile.mdn": t.data.mdn
                                    }
                                },
                                success: function(t) {
                                    e(null, t[0])
                                }
                            })
                        }
                        , function(t, e) {
                            t ? n.requestKazooDeleteDevice({
                                data: {
                                    deviceId: t.id
                                },
                                success: function() {
                                    e(null)
                                }
                            }) : e(null)
                        }
                        ], function(t, n) {
                            e(null)
                        })
                    }
                }, function(t, n) {
                    e(null)
                })
            }
            ], function(n, e) {
                t.hasOwnProperty("success") && t.success()
            })
        },
        helperSaveTopAccount: function(t) {
            var n = this
              , e = t.data.accountId
              , l = t.data.formData;
            e ? n.requestTopUpdateAccount({
                data: {
                    data: l
                },
                success: function() {
                    n.render()
                }
            }) : n.requestTopCreateAccount({
                data: {
                    data: l
                },
                success: function() {
                    n.render()
                }
            })
        },
        formatUsageDataToWidget: function(t) {
            var n, e, a = this, i = t.cap, o = t.usage, r = {
                cap: l.util.formatBytes(i),
                usage: l.util.formatBytes(o)
            };
            return i && (n = Math.round(100 * o / i),
            n >= a.appFlags.usageWidget.thresholds.error ? e = "error" : n >= a.appFlags.usageWidget.thresholds.warning && (e = "warning"),
            e && (r.status = e),
            r.percentage = n),
            r
        },
        generateSliderSettings: function(t) {
            var n = this
              , e = {
                range: "max",
                min: 100,
                step: 100,
                i18n: {
                    maxHandle: {
                        text: n.i18n.active().mobileApp.misc.sliderHandles.throttleData
                    }
                },
                unit: n.i18n.active().unitsMultiple.byte[2].symbol
            };
            return t.blocking.cap > 0 ? (e.max = t.blocking.cap / 1e6,
            0 === t.throttling.cap ? e.value = t.blocking.cap / 1e6 * 80 / 100 : e.value = t.throttling.cap / 1e6,
            e) : (e.max = 5e4,
            e.value = 80 * e.max / 100,
            e)
        },
        reconcileMobileRelatedEntities: function(t) {
            var n = this
              , e = t.data.reconcile.device
              , a = t.data.reconcile.callflow
              , i = function(e) {
                a ? n.requestPatchCallflow({
                    data: {
                        callflowId: a.id,
                        data: {
                            flow: {
                                module: "device",
                                data: {
                                    id: e.id
                                }
                            }
                        }
                    },
                    success: function() {
                        t.callback()
                    }
                }) : l.waterfall([function(t) {
                    n.requestListCallflows({
                        data: {
                            filters: {
                                filter_type: "mainUserCallflow"
                            }
                        },
                        success: function(n) {
                            t(null, n)
                        }
                    })
                }
                , function(l, a) {
                    n.requestCreateCallflow({
                        data: n.generateCallflowData({
                            topDevice: t.data.deviceInfo,
                            kazooDevice: e,
                            mainUserCallflows: l
                        }),
                        success: function() {
                            a(null)
                        }
                    })
                }
                ], function(n, e) {
                    t.callback()
                })
            };
            e ? i(e) : n.requestKazooCreateDevice({
                data: {
                    data: {
                        name: t.data.deviceInfo.name,
                        mobile: {
                            id: t.data.deviceInfo.id,
                            mdn: t.data.deviceInfo.subscription.mdn
                        },
                        sip: {
                            username: t.data.deviceInfo.voice.sip.username,
                            password: t.data.deviceInfo.voice.sip.password
                        }
                    }
                },
                success: function(t) {
                    i(t)
                }
            })
        },
        utilSanitizeFeatures: function(t) {
            var n = e.includes(t.subscription.features, "mms")
              , l = e.includes(t.subscription.features, "sms_blocking");
            return n && l ? t.subscription.features.splice(t.subscription.features.indexOf("mms"), 1) : n || l || t.subscription.features.push("sms_blocking"),
            t
        },
        utilGetTopAccountDefaults: function() {
            var t = this
              , n = t.appFlags.rates[0].value;
            return e.merge({
                data: {
                    throttling: {
                        rate: n
                    }
                },
                device_defaults: {
                    data: {
                        throttling: {
                            rate: n
                        }
                    }
                }
            }, t.appFlags.defaults.account)
        },
        requestTopGetDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.get",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, l) {
                    t.hasOwnProperty("success") && t.success(e.utilSanitizeFeatures(n.data))
                },
                error: function(n, e, l) {
                    404 === n.error ? t.hasOwnProperty("success") && t.success() : (l(n, {
                        generateError: !0
                    }),
                    t.hasOwnProperty("error") && t.error(n))
                }
            })
        },
        requestTopPatchDevice: function(t) {
            var n = this;
            l.request({
                resource: "top.devices.patch",
                data: e.extend({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopDesactivateDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.deactivate",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopListDevices: function(t) {
            var n = this;
            l.request({
                resource: "top.devices.list",
                data: {
                    accountId: n.accountId,
		    filters: {
            'filter_device_type': 'mobile'
        }
                },
                success: function(n, l) {
                    t.hasOwnProperty("success") && t.success(e.keyBy(n.data, "id"))
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopValidateDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.validate",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e, l) {
                    400 === e.status || 404 === e.status ? t.hasOwnProperty("success") && t.success({
                        valid: !1
                    }) : (t.hasOwnProperty("error") && t.error(),
                    l(e, {
                        generateError: !1
                    }))
                }
            })
        },
        requestTopActivateDevice: function(t) {
            var e = this
              , a = t.data.data;
		// --- LOG DE CONTROL ---
    console.log("=== EJECUTANDO NUEVA VERSION DE ACTIVATE DEVICE ===");
    console.log("Data original recibida:", JSON.parse(JSON.stringify(a)));
	  // --- CORRECCIÓN ESTRUCTURAL DE SUBSCRIPTION.MDN ---
    // Extraer el MDN de donde sea que venga (mdn plano, mobile.mdn o subscription.mdn)
    var mdnVal = a.mdn || (a.mobile && a.mobile.mdn) || (a.subscription && a.subscription.mdn) || "";

    // Construir explícitamente el objeto subscription requerido por la API TOP/Kazoo
    a.subscription = {
        mdn: mdnVal
    };

    // Opcional: Limpiar el mdn plano si existía
   delete a.mdn;
    // ----------------------------------------------------	
            a.hasOwnProperty("carrier") || (a.carrier = {
                features: []
            }),
            a.carrier.features.indexOf("mms") < 0 && a.carrier.features.push("sms_blocking"),
            l.request({
                resource: "top.devices.activate",
                data: n.extend(!0, {
                    accountId: e.accountId,
                    data: {
                        voice: {
                            sip: {
                                realm: l.apps.auth.currentAccount.realm,
                                username: "user_" + l.util.randomString(6),
                                password: l.util.randomString(12)
                            }
                        }
                    }
                }, t.data),
                success: function(n, l) {
                    e.appFlags.isActivating = !1,
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopUpdateDeviceSubscription: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.subscription.update",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopGetDeviceUsage: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.usage",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopSuspendDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.suspend",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopRestoreDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.restore",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopReplaceDevice: function(t) {
            var e = this;
            l.request({
                resource: "top.devices.replace",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e, a) {
                    400 === n.error ? l.ui.toast({
                        type: "warning",
                        message: n.message
                    }) : 500 === n.error && n.data.hasOwnProperty("text") ? l.ui.toast({
                        type: "error",
                        message: n.data.text
                    }) : a(e, {
                        generateError: !0
                    }),
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopCreateAccount: function(t) {
            var n = this;
            l.request({
                resource: "top.accounts.create",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopGetAccount: function(t) {
            var n = this;
            l.request({
                resource: "top.accounts.get",
                data: {
                    accountId: n.accountId
                },
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(e, l, a) {
                    404 === l.status ? t.hasOwnProperty("success") && t.success(n.utilGetTopAccountDefaults()) : a(l, {
                        generateError: !0
                    })
                }
            })
        },
        requestTopUpdateAccount: function(t) {
            var e = this;
            l.request({
                resource: "top.accounts.update",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopGetAccountUsage: function(t) {
            var n = this;
            l.request({
                resource: "top.accounts.usage",
                data: {
                    accountId: n.accountId
                },
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopGetAccountUsageAsCsv: function(t) {
            var e = this;
            if (!t.hasOwnProperty("data")) {
                var a = new Date
                  , i = a.getFullYear()
                  , o = a.getMonth() + 1;
                t.data = {
                    month: i + (o < 10 ? "0" + o : o)
                }
            }
            l.request({
                resource: "top.accounts.usageCsv",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopGetPorting: function(t) {
            var e = this;
            l.request({
                resource: "top.porting.get",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(l, a) {
                    n.extend(!0, l.data, {
                        additional_properties: {
                            submitted_by: e.i18n.active().mobileApp.misc.unknown
                        }
                    }),
                    t.hasOwnProperty("success") && t.success(l.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopCreatePorting: function(t) {
            var e = this;
            l.request({
                resource: "top.porting.create",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopUpdatePorting: function(t) {
            var e = this;
            l.request({
                resource: "top.porting.update",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e, l) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopListPorting: function(t) {
            var a = this;
            l.request({
                resource: "top.porting.list",
                data: {
                    accountId: a.accountId
                },
                success: function(l, i) {
                    e.each(l.data, function(t, e, l) {
                        n.extend(!0, l[e], {
                            additional_properties: {
                                submitted_by: a.i18n.active().mobileApp.misc.unknown
                            }
                        })
                    }),
                    t.hasOwnProperty("success") && t.success(l.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestTopDeletePorting: function(t) {
            var e = this;
            l.request({
                resource: "top.porting.delete",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e, l) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestTopValidatePorting: function(t) {
            l.request({
                resource: "top.porting.validate",
                data: n.extend(!0, {
                    carrier: "sprint"
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestKazooCreateDevice: function(t) {
		console.log("requestKazooCreateDevice neutralizada: Omitiendo petición API.");
		if (t && typeof t.success === "function") {
        t.success({
            data: {
                id: (t.data && t.data.data && t.data.data.id) || "MOCK_DEVICE_ID"
            }
        });
    }
            var e = this;
	    // --- FORZAR SUBSCRIPTION MDN ---
    if (t.data && t.data.data) {
        var mdnVal = t.data.data.mdn || (t.data.data.mobile && t.data.data.mobile.mdn) || "";
        t.data.data.subscription = {
            mdn: mdnVal
        };
    }
    
		/*
    // -------------------------------
// Antes de hacer la llamada final de activación:
if (t.data.data.mobile && t.data.data.mobile.id) {
    delete t.data.data.mobile.id;	
}	
    delete t.data.data.id;	

if (t.data && t.data.esn) {
        t.data.id = t.data.esn;
    }


            e.callApi({
                apiUrl: l.config.api.default,
                resource: "device.create",
                data: n.extend(!0, {
                    accountId: e.accountId,
		    id: t.esn,
                    data: t.data
                        
                       
                      
                     
                    
                    
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
	*/	
        },
        requestKazooPatchDevice: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "device.patch",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestKazooDeleteDevice: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "device.delete",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestKazooListDevices: function(t) {
            var e = this;
            t.data.hasOwnProperty("filters") && t.data.filters.hasOwnProperty("filter_mobile.mdn") && (t.data.filters["filter_mobile.mdn"] = encodeURIComponent(t.data.filters["filter_mobile.mdn"])),
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "device.list",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestGetCallflow: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.get",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestCreateCallflow: function(t) {
            var e = this
              , a = {
                numbers: [t.data.mdn],
                name: e.i18n.active().mobileApp.misc.callflowName.replace("{{variable}}", l.util.formatPhoneNumber(t.data.mdn)),
                type: "mobile"
            };
            t.data.hasOwnProperty("userId") && (a.owner_id = t.data.userId),
            t.data.hasOwnProperty("deviceId") ? (n.extend(!0, a, {
                flow: {
                    module: "device",
                    data: {
                        id: t.data.deviceId
                    }
                }
            }),
            t.data.hasOwnProperty("voicemailBoxId") && n.extend(!0, a, {
                flow: {
                    children: {
                        _: {
                            children: {},
                            data: {
                                id: t.data.voicemailBoxId
                            },
                            module: "voicemail"
                        }
                    }
                }
            })) : t.data.hasOwnProperty("callflowId") && n.extend(!0, a, {
                flow: {
                    module: "callflow",
                    data: {
                        id: t.data.callflowId
                    }
                }
            }),
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.create",
                data: {
                    accountId: e.accountId,
                    data: a
                },
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestUpdateCallflow: function(t) {
            var e = this;
            t.data.data.hasOwnProperty("featurecode") && delete t.data.data.featurecode,
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.update",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestPatchCallflow: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.patch",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestDeleteCallflow: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.delete",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestListCallflows: function(t) {
            var e = this;
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.list",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestSearchCallflowsByNumbers: function(t) {
            var e = this;
            t.data.value = encodeURIComponent(t.data.value),
            e.callApi({
                apiUrl: l.config.api.default,
                resource: "callflow.searchByNumber",
                data: n.extend(!0, {
                    accountId: e.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestListUsers: function(t) {
            var n = this;
            n.callApi({
                apiUrl: l.config.api.default,
                resource: "user.list",
                data: {
                    accountId: n.accountId
                },
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestListVoicemailBoxes: function(t) {
            var n = this;
            n.callApi({
                apiUrl: l.config.api.default,
                resource: "voicemail.list",
                data: {
                    accountId: n.accountId
                },
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestCheckCoverage: function(t) {
            l.request({
                resource: "top.coverage.check",
                data: t.data,
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        },
        requestGetAddressInfo: function(t) {
            l.request({
                resource: "google.geocode.address",
                data: n.extend(!0, {
                    country: "US"
                }, t.data),
                success: function(n, e) {
                    n.results.length ? t.hasOwnProperty("success") && t.success(n.results[0]) : t.hasOwnProperty("error") && t.error()
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error()
                }
            })
        }
    }
}),
this.monster = this.monster || {},
this.monster.cache = this.monster.cache || {},
this.monster.cache.templates = this.monster.cache.templates || {},
this.monster.cache.templates.mobile = this.monster.cache.templates.mobile || {},
this.monster.cache.templates.mobile._main = this.monster.cache.templates.mobile._main || {},
this.monster.cache.templates.mobile._main.accountSettings = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<input type="checkbox" id="account_throttling_cap" name="data.throttling.cap"' + (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != (i = null != n ? n.data : n) ? i.data : i) ? i.throttle : i) ? i.cap : i, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    2: function(t, n, e, l, a) {
        return ' checked="checked"'
    },
    4: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.rates : n, {
            name: "each",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    5: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t<option value="' + s((i = null != (i = e.value || (null != n ? n.value : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "value",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.text || (null != n ? n.text : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "text",
            hash: {},
            data: a
        }) : i)) + "</option>\n"
    },
    7: function(t, n, e, l, a) {
        return '\t\t\t\t<input type="checkbox" id="defaults_throttling_cap" name="device_defaults.data.throttling.cap">\n'
    },
    9: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<input type="checkbox" id="defaults_hoptspot_enabled" name="device_defaults.features[]" value="tethering"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "tethering", null != (i = null != (i = null != n ? n.data : n) ? i.device_defaults : i) ? i.features : i, {
            name: "ifInArray",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    11: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<input type="checkbox" id="defaults_messaging_enabled" name="device_defaults.features[]" value="mms"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "mms", null != (i = null != (i = null != n ? n.data : n) ? i.device_defaults : i) ? i.features : i, {
            name: "ifInArray",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o, r, s = (t.propertyIsEnumerable,
        t.lambda), c = t.escapeExpression, u = null != n ? n : t.nullContext || {}, d = t.hooks.helperMissing, p = t.hooks.blockHelperMissing, m = '<div class="app-content form">\n\t<form class="form form-horizontal form-inline" id="account_settings_form">\n\n\t\t<fieldset>\n\t\t\t<legend>\n\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.legend : i, n)) + '\n\t\t\t</legend>\n\t\t\t<p class="help-text">\n\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.helpText : i, n)) + '\n\t\t\t</p>\n\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="account_blocking_cap" class="control-label">\n\t\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.accountDataLimit : i) ? i.label : i, n)) + ' \n\t\t\t\t\t<i class="fa fa-question-circle" data-original-title="' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.accountDataLimit : i) ? i.tooltip : i, n)) + '" data-toggle="tooltip"></i>\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" class="span2 align-right" id="account_blocking_cap" name="data.blocking.cap" value="' + c(s(null != (i = null != (i = null != (i = null != n ? n.data : n) ? i.data : i) ? i.blocking : i) ? i.cap : i, n)) + '">\n\t\t\t\t\t<span class="unit-helper">\n\t\t\t\t\t\t<span class="unit">\n\t\t\t\t\t\t\t' + c((o = null != (o = e.unit || (null != n ? n.unit : n)) ? o : d,
        "function" == typeof o ? o.call(u, {
            name: "unit",
            hash: {},
            data: a
        }) : o)) + "\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t" + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.accountDataLimit : i) ? i.helpText : i, n)) + '\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div id="account_blocking_cap_group">\n\n\t\t\t<div class="control-group">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || d).call(u, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.limits : i) ? i.checkboxes : i) ? i.throttleData : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</div>\n\n\t\t\t<div id="account_throttling_rate_group">\n\n\t\t\t<select name="data.throttling.rate" id="account_throttling_rate">\n' + (null != (i = (e.select || n && n.select || d).call(u, null != (i = null != (i = null != (i = null != n ? n.data : n) ? i.data : i) ? i.throttling : i) ? i.rate : i, {
            name: "select",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</select>\n\n\t\t\t<div class="slider-container" id="account_slider"></div>\n\n\t\t\t</div>\n\n\t\t\t</div>\n\t\t</fieldset>\n\n\t\t<fieldset>\n\t\t\t<legend>\n\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.legend : i, n)) + '\n\t\t\t</legend>\n\t\t\t<p class="help-text">\n\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.helpText : i, n)) + "\n\t\t\t</p>\n\n\t\t\t<h4>\n\t\t\t\t" + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.limits : i) ? i.title : i, n)) + '\n\t\t\t</h4>\n\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="defaults_blocking_cap" class="control-label">\n\t\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.limits : i) ? i.montlyDataLimit : i) ? i.label : i, n)) + ' \n\t\t\t\t\t<i class="fa fa-question-circle" data-original-title="' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.limits : i) ? i.montlyDataLimit : i) ? i.tooltip : i, n)) + '" data-toggle="tooltip"></i>\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" class="span2 align-right" id="defaults_blocking_cap" name="device_defaults.data.blocking.cap" value="' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.data : n) ? i.device_defaults : i) ? i.data : i) ? i.blocking : i) ? i.cap : i, n)) + '">\n\t\t\t\t\t<span class="unit-helper">\n\t\t\t\t\t\t<span class="unit">\n\t\t\t\t\t\t\t' + c((o = null != (o = e.unit || (null != n ? n.unit : n)) ? o : d,
        "function" == typeof o ? o.call(u, {
            name: "unit",
            hash: {},
            data: a
        }) : o)) + "\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t" + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.limits : i) ? i.montlyDataLimit : i) ? i.helpText : i, n)) + '\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div id="defaults_blocking_cap_group">\n\n\t\t\t<div class="control-group">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || d).call(u, null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.limits : i) ? i.checkboxes : i) ? i.throttleData : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</div>\n\n\t\t\t<div id="defaults_throttling_rate_group">\n\n\t\t\t<select name="device_defaults.data.throttling.rate" id="defaults_throttling_rate">\n' + (null != (i = (e.select || n && n.select || d).call(u, null != (i = null != (i = null != (i = null != (i = null != n ? n.data : n) ? i.device_defaults : i) ? i.data : i) ? i.throttling : i) ? i.rate : i, {
            name: "select",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</select>\n\n\t\t\t<div class="slider-container" id="defaults_slider"></div>\n\n\t\t\t</div>\n\n\t\t\t</div>\n\n\t\t\t<h4>\n\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.features : i) ? i.title : i, n)) + '\n\t\t\t</h4>\n\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="defaults_hoptspot_enabled" class="control-label">\n\t\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.allowHotspot : i, n)) + ' \n\t\t\t\t\t<i class="fa fa-question-circle" data-original-title="' + c(s(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.accountSettings : i) ? i.defaults : i) ? i.features : i) ? i.tooltips : i) ? i.tethering : i, n)) + '" data-toggle="tooltip"></i>\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n';
        return o = null != (o = e.monsterSwitch || (null != n ? n.monsterSwitch : n)) ? o : d,
        r = {
            name: "monsterSwitch",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        },
        i = "function" == typeof o ? o.call(u, r) : o,
        e.monsterSwitch || (i = p.call(n, i, r)),
        null != i && (m += i),
        m += '\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="defaults_messaging_enabled" class="control-label">\n\t\t\t\t\t' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.enableMessaging : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n',
        o = null != (o = e.monsterSwitch || (null != n ? n.monsterSwitch : n)) ? o : d,
        r = {
            name: "monsterSwitch",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        },
        i = "function" == typeof o ? o.call(u, r) : o,
        e.monsterSwitch || (i = p.call(n, i, r)),
        null != i && (m += i),
        m + '\t\t\t\t</div>\n\t\t\t</div>\n\t\t</fieldset>\n\t</form>\n\n\t<div class="form-actions">\n\t\t<div class="pull-right">\n\t\t\t<button class="monster-button-cancel" id="cancel">\n\t\t\t\t' + c(s(null != (i = null != n ? n.i18n : n) ? i.cancel : i, n)) + '\n\t\t\t</button>\n\t\t\t<button class="monster-button-success" id="save">\n\t\t\t\t' + c(s(null != (i = null != n ? n.i18n : n) ? i.saveChanges : i, n)) + "\n\t\t\t</button>\n\t\t</div>\n\t</div>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main.accountUsage = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return " " + t.escapeExpression((i = null != (i = e.status || (null != n ? n.status : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(null != n ? n : t.nullContext || {}, {
            name: "status",
            hash: {},
            data: a
        }) : i))
    },
    3: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t<div class="detail">\n\t\t' + r(o(null != (i = null != n ? n.usage : n) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != n ? n.usage : n) ? i.unit : i) ? i.symbol : i, n)) + " / " + r(o((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.misc) && i.usageWidget) && i.unlimited, n)) + "\n\t</div>\n"
    },
    5: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), s = t.hooks.helperMissing, c = t.lambda, u = t.escapeExpression;
        return (null != (i = (e.compare || n && n.compare || s).call(r, null != n ? n.percentage : n, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t<div class="detail">\n\t\t' + u(c(null != (i = null != n ? n.usage : n) ? i.value : i, n)) + " " + u(c(null != (i = null != (i = null != n ? n.usage : n) ? i.unit : i) ? i.symbol : i, n)) + " / " + u(c(null != (i = null != n ? n.cap : n) ? i.value : i, n)) + " " + u(c(null != (i = null != (i = null != n ? n.cap : n) ? i.unit : i) ? i.symbol : i, n)) + " (" + u((o = null != (o = e.percentage || (null != n ? n.percentage : n)) ? o : s,
        "function" == typeof o ? o.call(r, {
            name: "percentage",
            hash: {},
            data: a
        }) : o)) + "%)\n\t</div>\n"
    },
    6: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {});
        return '\t<div class="progress progress-' + (null != (i = e.if.call(r, null != n ? n.status : n, {
            name: "if",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.program(12, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t<div class="bar" style="width: ' + t.escapeExpression((o = null != (o = e.percentage || (null != n ? n.percentage : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(r, {
            name: "percentage",
            hash: {},
            data: a
        }) : o)) + '%"></div>\n\t</div>\n'
    },
    7: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.status : n, "===", "error", {
            name: "compare",
            hash: {},
            fn: t.program(8, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.status : n, "===", "warning", {
            name: "compare",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    8: function(t, n, e, l, a) {
        return "danger"
    },
    10: function(t, n, e, l, a) {
        return "warning"
    },
    12: function(t, n, e, l, a) {
        return "success"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {});
        return '<div class="usage-widget account-usage">\n\t<h6 class="title">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.usageWidget : i) ? i.totalAccount : i, n)) + '</h6>\n\t<div class="usage-widget-container' + (null != (i = e.if.call(o, null != n ? n.status : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n' + (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(o, null != (i = null != n ? n.cap : n) ? i.value : i, "===", 0, {
            name: "compare",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.program(5, a, 0),
            data: a
        })) ? i : "") + "\t</div>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["activation-deviceActivation"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return t.escapeExpression((i = null != (i = e.postalCode || (null != n ? n.postalCode : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(null != n ? n : t.nullContext || {}, {
            name: "postalCode",
            hash: {},
            data: a
        }) : i))
    },
    3: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t<input type="text" name="device.sim" id="sim" placeholder="' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.placeholders : i) ? i.sim : i, n)) + '">\n'
    },
    5: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t<input type="checkbox" name="device.carrier.features[]" value="tethering"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "tethering", null != n ? n.features : n, {
            name: "ifInArray",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    6: function(t, n, e, l, a) {
        return ' checked="checked"'
    },
    8: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t<input type="checkbox" name="device.carrier.features[]" value="mms"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "mms", null != n ? n.features : n, {
            name: "ifInArray",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    10: function(t, n, e, l, a) {
        return '\t\t<input type="checkbox" name="is_smartpbx_user" id="is_smartpbx_user">\n'
    },
    12: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.users : n, {
            name: "each",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    13: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t<option value="' + s((i = null != (i = e.id || (null != n ? n.id : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "id",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.first_name || (null != n ? n.first_name : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "first_name",
            hash: {},
            data: a
        }) : i)) + " " + s((i = null != (i = e.last_name || (null != n ? n.last_name : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "last_name",
            hash: {},
            data: a
        }) : i)) + "</option>\n"
    },
    15: function(t, n, e, l, a) {
        return '\t\t\t<input type="checkbox" name="has_voicemail_box" id="has_voicemail_box">\n'
    },
    17: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t<option value="' + s((i = null != (i = e.id || (null != n ? n.id : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "id",
            hash: {},
            data: a
        }) : i)) + '" data-owner_id="' + s((i = null != (i = e.owner_id || (null != n ? n.owner_id : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "owner_id",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.name || (null != n ? n.name : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "name",
            hash: {},
            data: a
        }) : i)) + "</option>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {}, c = t.hooks.helperMissing;
        return '<div class="app-content device-activation step-1">\n\t<h3 class="title">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.text : i, n)) + '</p>\n\t<form class="input-container" id="activation_form">\n\t\t<input type="text" name="device.postal_code" id="postal_code" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.placeholders : i) ? i.zipCode : i, n)) + '" value="' + (null != (i = e.if.call(s, null != n ? n.postalCode : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t\t<input type="text" name="device.name" id="name" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.placeholders : i) ? i.deviceName : i, n)) + '">\n'  +  '<input type="text" name="device.subscription.mdn" id="mdn" placeholder="Mobile Directory Number (MDN)" style="margin-top: 10px;">'  + (null != (i = e.if.call(s, null != n ? n.isSimRequired : n, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || c).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.allowHotspot : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || c).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.enableMessaging : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(8, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || c).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.labels : i) ? i.linkDevice : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t<div id="user_id_container">\n\t\t\t<select name="user_id" id="user_id">\n' + (null != (i = (e.select || n && n.select || c).call(s, null != n ? n.currentUserId : n, {
            name: "select",
            hash: {},
            fn: t.program(12, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</select>\n\t\t</div>\n\t\t<div id="voicemail_box_container">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || c).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.labels : i) ? i.LinkVoicemailBox : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t<div id="voicemail_box_id_container">\n\t\t\t\t<select name="voicemail_box_id" id="voicemail_box_id">\n' + (null != (i = e.each.call(s, null != n ? n.voicemailBoxes : n, {
            name: "each",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</select>\n\t\t\t</div>\n\t\t</div>\n\t\t<button class="monster-button-primary activate-device">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceActivation : i) ? i.button : i, n)) + "</button>\n\t</form>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["activation-deviceValidation"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return "in"
    },
    3: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t<i class="fa fa-check-circle-o iconography"></i>\n\t<h3 class="title">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.success : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.success : i) ? i.text : i, n)) + '</p>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel cancel">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.success : i) ? i.buttons : i) ? i.cancel : i, n)) + '</button>\n\t\t<button class="monster-button-primary check-coverage">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.success : i) ? i.buttons : i) ? i.checkCoverage : i, n)) + '</button>\n\t\t<button class="monster-button-secondary activate-device">\n\t\t\t<i class="fa fa-step-forward"></i>\n\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.success : i) ? i.buttons : i) ? i.skipToActivation : i, n)) + "\n\t\t</button>\n\t</div>\n"
    },
    5: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t<i class="fa fa-times-circle-o iconography"></i>\n\t<h3 class="title">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.error : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">\n' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != n ? n.isInUse : n, {
            name: "if",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.program(8, a, 0),
            data: a
        })) ? i : "") + '\t</p>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel cancel">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.error : i) ? i.button : i, n)) + "</button>\n\t</div>\n"
    },
    6: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t" + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.error : i) ? i.texts : i) ? i.esnInUse : i, n)) + "\n"
    },
    8: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t" + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceValidation : i) ? i.error : i) ? i.texts : i) ? i.invalidEsn : i, n)) + "\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {});
        return '<div class="app-content ' + (null != (i = e.unless.call(o, null != n ? n.isValid : n, {
            name: "unless",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + 'valid-response">\n' + (null != (i = e.if.call(o, null != n ? n.isValid : n, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.program(5, a, 0),
            data: a
        })) ? i : "") + "</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["activation-esnCheck"] = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content esn-check">\n\t<h3 class="title">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.esnCheck : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.esnCheck : i) ? i.text : i, n)) + '</p>\n\t<form class="input-container" id="esn_check_form">\n\t\t<input id="esn" name="esn" type="text" placeholder="' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.esnCheck : i) ? i.placeholder : i, n)) + '">\n\t\t<button class="monster-button-primary action-button">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.esnCheck : i) ? i.button : i, n)) + "</button>\n\t</form>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["activation-success"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.lambda), s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing;
        return '\t\t<label for="">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.activationSuccess) && i.labels) && i.deviceName, n)) + " <span>" + s((o = null != (o = e.name || (null != n ? n.name : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "name",
            hash: {},
            data: a
        }) : o)) + '</span></label>\n\t\t<label for="">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.activationSuccess) && i.labels) && i.deviceMdn, n)) + " <span>" + s((e.formatPhoneNumber || n && n.formatPhoneNumber || u).call(c, null != (i = null != n ? n.subscription : n) ? i.mdn : i, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + '</span></label>\n\t\t<label for="">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.activationSuccess) && i.labels) && i.deviceEsn, n)) + " <span>" + s(r(null != (i = null != n ? n.subscription : n) ? i.esn : i, n)) + "</span></label>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.lambda), s = t.escapeExpression, c = null != n ? n : t.nullContext || {};
        return '<div class="app-content activation-success step-2">\n\t<i class="fa fa-check-circle-o iconography"></i>\n\t<h3 class="title">' + s(r(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.titles : i) ? i.overview : i, n)) + '</h3>\n\t<p class="text">' + s(r(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.texts : i) ? i.overview : i, n)) + '</p>\n\t<div class="overview">\n' + (null != (i = e.with.call(c, null != n ? n.device : n, {
            name: "with",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t<label for="">' + s(r(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.labels : i) ? i.zipCode : i, n)) + " <span>" + s((o = null != (o = e.postalCode || (null != n ? n.postalCode : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(c, {
            name: "postalCode",
            hash: {},
            data: a
        }) : o)) + '</span></label>\n\t</div>\n\t<h3 class="title">' + s(r(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.titles : i) ? i.provisioning : i, n)) + '</h3>\n\t<p class="text">' + s(r(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.texts : i) ? i.provisioning : i, n)) + '</p>\n\t<button class="monster-button-primary provision-device">' + s(r(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.activationSuccess : i) ? i.button : i, n)) + "</button>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["coverage-checkZipCode"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return " step-" + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != n ? n.postalCode : n, {
            name: "if",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.program(4, a, 0),
            data: a
        })) ? i : "")
    },
    2: function(t, n, e, l, a) {
        return "1"
    },
    4: function(t, n, e, l, a) {
        return "0"
    },
    6: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t" + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.checkZipCode : i) ? i.titles : i) ? i.activating : i, n)) + "\n"
    },
    8: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t" + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.checkZipCode : i) ? i.titles : i) ? i.normal : i, n)) + "\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.lambda, s = t.escapeExpression;
        return '<div class="app-content check-zipCode' + (null != (i = e.if.call(o, null != n ? n.isActivating : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t<h3 class="title">\n' + (null != (i = e.if.call(o, null != n ? n.isActivating : n, {
            name: "if",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.program(8, a, 0),
            data: a
        })) ? i : "") + '\t</h3>\n\t<p class="text">' + s(r(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.checkZipCode : i) ? i.text : i, n)) + '</p>\n\t<form class="input-container" id="check_coverage_form">\n\t\t<input type="text" id="postal_code" name="postal_code" placeholder="' + s(r(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.checkZipCode : i) ? i.placeholder : i, n)) + '">\n\t\t<button class="monster-button-primary check-coverage">' + s(r(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.checkZipCode : i) ? i.button : i, n)) + "</button>\n\t</form>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["coverage-info"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " step-1"
    },
    3: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = (e.monsterSignalIndicator || n && n.monsterSignalIndicator || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, n, {
            name: "monsterSignalIndicator",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    4: function(t, n, e, l, a) {
        t.propertyIsEnumerable;
        return "\t\t\t" + t.escapeExpression((e.toUpperCase || n && n.toUpperCase || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, a && a.key, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + "\n"
    },
    6: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t<button class="monster-button-primary activate">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.coverageInfo : i) ? i.buttons : i) ? i.activate : i, n)) + "</button>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), s = t.lambda, c = t.escapeExpression;
        return '<div class="app-content coverage-info' + (null != (i = e.if.call(r, null != n ? n.isActivating : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t<h3 class="title">' + c(s(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.coverageInfo : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">' + c((o = null != (o = e.address || (null != n ? n.address : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(r, {
            name: "address",
            hash: {},
            data: a
        }) : o)) + '</p>\n\t<div class="coverage-info">\n' + (null != (i = e.each.call(r, null != n ? n.coverage : n, {
            name: "each",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t</div>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel check-zipCode">' + c(s(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.coverageInfo : i) ? i.buttons : i) ? i.check : i, n)) + "</button>\n" + (null != (i = e.if.call(r, null != n ? n.isActivating : n, {
            name: "if",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t</div>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main.deviceInfo = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " suspended"
    },
    3: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    4: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return " " + t.escapeExpression(t.lambda(null != (i = null != n ? n.widget : n) ? i.status : i, n))
    },
    6: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t<div class="detail">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.unit : i) ? i.symbol : i, n)) + " / " + r(o((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.misc) && i.usageWidget) && i.unlimited, n)) + "\n\t\t\t\t</div>\n"
    },
    8: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.widget : n) ? i.percentage : i, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t<div class="detail">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.unit : i) ? i.symbol : i, n)) + " / " + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.unit : i) ? i.symbol : i, n)) + " (" + r(o(null != (i = null != n ? n.widget : n) ? i.percentage : i, n)) + "%)\n\t\t\t\t</div>\n"
    },
    9: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<div class="progress progress-' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.program(15, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t<div class="bar" style="width: ' + t.escapeExpression(t.lambda(null != (i = null != n ? n.widget : n) ? i.percentage : i, n)) + '%"></div>\n\t\t\t\t</div>\n'
    },
    10: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return (null != (i = (e.compare || n && n.compare || r).call(o, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "error", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "warning", {
            name: "compare",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    11: function(t, n, e, l, a) {
        return "danger"
    },
    13: function(t, n, e, l, a) {
        return "warning"
    },
    15: function(t, n, e, l, a) {
        return "success"
    },
    17: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t<div class="device-image">\n\t\t\t\t<i class="' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.userAgent : i) ? i.info : i) ? i.css : i, n)) + '"></i>\n\t\t\t</div>\n'
    },
    19: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t<div class="device-image ' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.userAgent : i) ? i.info : i) ? i.css : i, n)) + '"></div>\n'
    },
    21: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<span class="label label-inverse">\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.devicesList) && i.table) && i.labels) && i.dataLimit, n)) + "\n\t\t\t\t\t</span>\n"
    },
    23: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<span class="label label-inverse">\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.devicesList) && i.table) && i.labels) && i.suspended, n)) + "\n\t\t\t\t\t</span>\n"
    },
    25: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="routing">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.offnetRouting : i, n)) + '</a>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="replace">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.replaceDevice : i, n)) + "</a>\n\t\t\t\t\t</li>\n"
    },
    27: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.lambda), s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing;
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="manufacturer" class="control-label">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.manufacturer, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + s((o = null != (o = e.manufacturer || (null != n ? n.manufacturer : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "manufacturer",
            hash: {},
            data: a
        }) : o)) + '</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="model_name" class="control-label">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.modelName, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + s((o = null != (o = e.name || (null != n ? n.name : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "name",
            hash: {},
            data: a
        }) : o)) + '</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="model_number" class="control-label">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.modelNumber, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + s((o = null != (o = e.number || (null != n ? n.number : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "number",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    29: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.escapeExpression), s = null != n ? n : t.nullContext || {};
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="esn" class="control-label">' + r(t.lambda((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.esn, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + r((o = null != (o = e.esn || (null != n ? n.esn : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(s, {
            name: "esn",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n" + (null != (i = e.if.call(s, null != n ? n.imsi : n, {
            name: "if",
            hash: {},
            fn: t.program(30, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    30: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.escapeExpression);
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="imsi" class="control-label">' + r(t.lambda((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.imsi, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + r((o = null != (o = e.imsi || (null != n ? n.imsi : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "imsi",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    32: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="msl" class="control-label">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.msl : i, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + r(o(null != (i = null != n ? n.device : n) ? i.msl : i, n)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    34: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.lambda), s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing;
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="mdn" class="control-label">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.mdn, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + s((o = null != (o = e.mdn || (null != n ? n.mdn : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "mdn",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n" + (null != (i = e.if.call(c, null != n ? n.carrier_data : n, {
            name: "if",
            hash: {},
            fn: t.program(35, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(c, null != n ? n.sim : n, {
            name: "if",
            hash: {},
            fn: t.program(38, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(c, null != n ? n.activation_date : n, {
            name: "if",
            hash: {},
            fn: t.program(40, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(c, null != n ? n.expiration_date : n, {
            name: "if",
            hash: {},
            fn: t.program(42, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="price_plan" class="control-label">' + s(r((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.plan, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + s((o = null != (o = e.plan || (null != n ? n.plan : n)) ? o : u,
        "function" == typeof o ? o.call(c, {
            name: "plan",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    35: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.carrier_data : n, {
            name: "each",
            hash: {},
            fn: t.program(36, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    36: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="' + s((i = null != (i = e.key || a && a.key) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "key",
            hash: {},
            data: a
        }) : i)) + '" class="control-label">\n\t\t\t\t\t\t' + s((e.toUpperCase || n && n.toUpperCase || r).call(o, a && a.key, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="contorl-text">\n\t\t\t\t\t\t\t' + s(t.lambda(n, n)) + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    38: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.escapeExpression);
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="sim" class="control-label">' + r(t.lambda((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.sim, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + r((o = null != (o = e.sim || (null != n ? n.sim : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "sim",
            hash: {},
            data: a
        }) : o)) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    40: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.escapeExpression);
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="activation_date" class="control-label">' + o(t.lambda((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.activationDate, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + o((e.toFriendlyDate || n && n.toFriendlyDate || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != n ? n.activation_date : n, "date", {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    42: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.escapeExpression);
        return '\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="expiration_date" class="control-label">' + o(t.lambda((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.deviceInfo) && i.labels) && i.expirationDate, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text">' + o((e.toFriendlyDate || n && n.toFriendlyDate || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != n ? n.expiration_date : n, "date", {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + "</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n"
    },
    44: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<button class="monster-button-secondary repair">\n\t\t\t\t\t<i class="fa fa-wrench"></i>\n\t\t\t\t\t' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.buttons : i) ? i.repair : i, n)) + "\n\t\t\t\t</button>\n"
    },
    46: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<button class="monster-button-success restore">\n\t\t\t\t\t' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.buttons : i) ? i.restore : i, n)) + "\n"
    },
    48: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<button class="monster-button-warning suspend">\n\t\t\t\t\t' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.buttons : i) ? i.suspend : i, n)) + "\n"
    },
    50: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<input type="checkbox" name="features[]" value="tethering"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "tethering", null != (i = null != n ? n.device : n) ? i.features : i, {
            name: "ifInArray",
            hash: {},
            fn: t.program(51, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    51: function(t, n, e, l, a) {
        return ' checked="checked"'
    },
    53: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<input type="checkbox" name="features[]" value="mms"' + (null != (i = (e.ifInArray || n && n.ifInArray || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "mms", null != (i = null != n ? n.device : n) ? i.features : i, {
            name: "ifInArray",
            hash: {},
            fn: t.program(51, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    55: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<input type="checkbox" id="device_limit_data" name="limit_data"' + (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.data : i) ? i.blocking : i) ? i.cap : i, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(51, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    57: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t\t<input type="checkbox" id="device_throttling_cap" name="device.data.throttling.cap"' + (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.data : i) ? i.throttling : i) ? i.cap : i, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(51, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    59: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.rates : n, {
            name: "each",
            hash: {},
            fn: t.program(60, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    60: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t\t\t\t\t<option value="' + s((i = null != (i = e.value || (null != n ? n.value : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "value",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.text || (null != n ? n.text : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "text",
            hash: {},
            data: a
        }) : i)) + "</option>\n"
    },
    62: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td data-sort-value="' + s((i = null != (i = e.timestamp || (null != n ? n.timestamp : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "timestamp",
            hash: {},
            data: a
        }) : i)) + '">' + s((e.toFriendlyDate || n && n.toFriendlyDate || r).call(o, null != n ? n.timestamp : n, "date", {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + '</td>\n\t\t\t\t\t\t\t<td data-sort-value="' + s((e.toFriendlyDate || n && n.toFriendlyDate || r).call(o, null != n ? n.timestamp : n, "shortTime", {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + '">' + s((e.toFriendlyDate || n && n.toFriendlyDate || r).call(o, null != n ? n.timestamp : n, "shortTime", {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + '</td>\n\t\t\t\t\t\t\t<td data-sort-value="' + s((i = null != (i = e.usage || (null != n ? n.usage : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "usage",
            hash: {},
            data: a
        }) : i)) + '">' + s((e.formatBytes || n && n.formatBytes || r).call(o, null != n ? n.usage : n, {
            name: "formatBytes",
            hash: {},
            data: a
        })) + "</td>\n\t\t\t\t\t\t</tr>\n"
    },
    64: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {};
        return '\t\t<div class="info-content-wrapper" data-tab="routing">\n\t\t\t<form class="info-content form-horizontal" id="form_offnet_routing">\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.realm : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" id="realm" name="voice.sip.realm"' + (null != (i = e.if.call(s, null != n ? n.isOffnetRoutingEnabled : n, {
            name: "if",
            hash: {},
            fn: t.program(65, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="username" class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.username : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" id="username" name="voice.sip.username"' + (null != (i = e.if.call(s, null != n ? n.isOffnetRoutingEnabled : n, {
            name: "if",
            hash: {},
            fn: t.program(67, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="password" class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.password : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="password" id="password" name="voice.sip.password"' + (null != (i = e.if.call(s, null != n ? n.isOffnetRoutingEnabled : n, {
            name: "if",
            hash: {},
            fn: t.program(69, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ' autocomplete="new-password">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<div class="controls">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || t.hooks.helperMissing).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.externalCluster : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(71, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="cluster-settings">\n\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label for="cluster_id" class="control-label">\n\t\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.clusterId : i, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<input type="text" id="cluster_id" name="voice.cluster_id" value="' + r(o(null != (i = null != (i = null != n ? n.device : n) ? i.voice : i) ? i.cluster_id : i, n)) + '">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</form>\n\t\t\t<div class="info-actions">\n\t\t\t\t<div class="actions pull-right">\n\t\t\t\t\t<button class="monster-button-primary delete-routing">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.buttons : i) ? i.clear : i, n)) + '</button>\n\t\t\t\t\t<button class="monster-button-success save-routing">' + r(o(null != (i = null != n ? n.i18n : n) ? i.save : i, n)) + '</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="info-content-wrapper" data-tab="replace">\n\t\t\t<form class="info-content form-horizontal" id="form_replace_device">\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="esn" class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.newIdentifier : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" id="new_identifier" name="device_id">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="sim_id" class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.labels : i) ? i.simId : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" id="sim_id" name="sim_id">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</form>\n\t\t\t<div class="info-actions">\n\t\t\t\t<div class="actions pull-right">\n\t\t\t\t\t<button class="monster-button-success replace-device">\n\t\t\t\t\t\t' + r(o(null != (i = null != n ? n.i18n : n) ? i.save : i, n)) + "\n\t\t\t\t\t</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n"
    },
    65: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return ' value="' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.voice : i) ? i.sip : i) ? i.realm : i, n)) + '"'
    },
    67: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return ' value="' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.voice : i) ? i.sip : i) ? i.username : i, n)) + '"'
    },
    69: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return ' value="' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.voice : i) ? i.sip : i) ? i.password : i, n)) + '"'
    },
    71: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<input type="checkbox" id="external" name="external" ' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != n ? n.device : n) ? i.voice : i) ? i.cluster_id : i, {
            name: "if",
            hash: {},
            fn: t.program(51, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "></input>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o, r, s = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), c = t.lambda, u = t.escapeExpression, d = t.hooks.helperMissing, p = t.hooks.blockHelperMissing, m = '<div class="app-content device-info">\n\t<div class="info-header-wrapper' + (null != (i = e.if.call(s, null != (i = null != (i = null != n ? n.device : n) ? i.subscription : i) ? i.suspended : i, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.program(3, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t<div class="info-header">\n\t\t\t<div class="usage-widget device-usage">\n\t\t\t\t<h6 class="title">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.usageWidget : i) ? i.totalDevice : i, n)) + '</h6>\n\t\t\t\t<div class="usage-widget-container' + (null != (i = e.if.call(s, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n' + (null != (i = (e.compare || n && n.compare || d).call(s, null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.value : i, "===", 0, {
            name: "compare",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.program(8, a, 0),
            data: a
        })) ? i : "") + "\t\t\t\t</div>\n\t\t\t</div>\n" + (null != (i = (e.compare || n && n.compare || d).call(s, null != (i = null != (i = null != n ? n.device : n) ? i.userAgent : i) ? i.name : i, "===", "other", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.program(19, a, 0),
            data: a
        })) ? i : "") + '\t\t\t<div class="device-contact">\n\t\t\t\t<div class="device-name">\n\t\t\t\t\t<span class="device-name-text">' + u(c(null != (i = null != n ? n.device : n) ? i.name : i, n)) + '</span>\n\t\t\t\t\t<input type="text" class="device-name-input" value="' + u(c(null != (i = null != n ? n.device : n) ? i.name : i, n)) + '">\n\t\t\t\t\t<a href="#" class="monster-link edit" id="edit_device_name">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.editName : i, n)) + '</a>\n\t\t\t\t</div>\n\t\t\t\t<div class="device-mdn">\n\t\t\t\t\t' + u((e.formatPhoneNumber || n && n.formatPhoneNumber || d).call(s, null != (i = null != (i = null != n ? n.device : n) ? i.subscription : i) ? i.mdn : i, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + "\n" + (null != (i = (e.compare || n && n.compare || d).call(s, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "error", {
            name: "compare",
            hash: {},
            fn: t.program(21, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(s, null != (i = null != (i = null != n ? n.device : n) ? i.subscription : i) ? i.suspended : i, {
            name: "if",
            hash: {},
            fn: t.program(23, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t</header>\n\t\t\t<nav class="monster-navbar reverse">\n\t\t\t\t<ul class="navbar-menu">\n\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link active" data-tab="info">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.deviceCarrierInfo : i, n)) + '</a>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="features">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.features : i, n)) + '</a>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="limits">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.deviceLimits : i, n)) + '</a>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="usage">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.header : i) ? i.deviceUsage : i, n)) + "</a>\n\t\t\t\t\t</li>\n";
        return o = null != (o = e.isPrivLevelAdmin || (null != n ? n.isPrivLevelAdmin : n)) ? o : d,
        r = {
            name: "isPrivLevelAdmin",
            hash: {},
            fn: t.program(25, a, 0),
            inverse: t.noop,
            data: a
        },
        i = "function" == typeof o ? o.call(s, r) : o,
        e.isPrivLevelAdmin || (i = p.call(n, i, r)),
        null != i && (m += i),
        m += '\t\t\t\t</ul>\n\t\t\t</nav>\n\t\t</div>\n\t</div>\n\n\t<div class="info-content-wrapper active" data-tab="info">\n\t\t<div class="info-content row-fluid">\n\t\t\t<form class="device-info span6 form-horizontal">\n\t\t\t\t<legend class="title">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.legends : i) ? i.deviceInfo : i, n)) + "</legend>\n" + (null != (i = e.with.call(s, null != (i = null != n ? n.device : n) ? i.model : i, {
            name: "with",
            hash: {},
            fn: t.program(27, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.with.call(s, null != (i = null != n ? n.device : n) ? i.subscription : i, {
            name: "with",
            hash: {},
            fn: t.program(29, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(s, null != (i = null != n ? n.device : n) ? i.msl : i, {
            name: "if",
            hash: {},
            fn: t.program(32, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</form>\n\t\t\t<form class="subscription-info span6 form-horizontal">\n\t\t\t\t<legend class="title">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.legends : i) ? i.subscriptionInfo : i, n)) + "</legend>\n" + (null != (i = e.with.call(s, null != (i = null != n ? n.device : n) ? i.subscription : i, {
            name: "with",
            hash: {},
            fn: t.program(34, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</form>\n\t\t</div>\n\t\t<div class="info-actions">\n\t\t\t<div class="actions pull-right">\n' + (null != (i = e.if.call(s, null != n ? n.showRepairButton : n, {
            name: "if",
            hash: {},
            fn: t.program(44, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(s, null != (i = null != (i = null != n ? n.device : n) ? i.subscription : i) ? i.suspended : i, {
            name: "if",
            hash: {},
            fn: t.program(46, a, 0),
            inverse: t.program(48, a, 0),
            data: a
        })) ? i : "") + '\t\t\t\t</button>\n\t\t\t\t<button class="monster-button-cancel back">' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceInfo : i) ? i.buttons : i) ? i.backToDevices : i, n)) + '</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div class="info-content-wrapper" data-tab="features">\n\t\t<form class="info-content form-horizontal" id="form_device_features">\n\t\t\t<div class="control-group">\n\t\t\t\t<div class="controls">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || d).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.allowHotspot : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(50, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group">\n\t\t\t\t<div class="controls">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || d).call(s, null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.labels : i) ? i.enableMessaging : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(53, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</div>\n\t\t\t</div>\n\t\t</form>\n\t\t<div class="info-actions">\n\t\t\t<div class="actions pull-right">\n\t\t\t\t<button class="monster-button-success save-features">\n\t\t\t\t\t' + u(c(null != (i = null != n ? n.i18n : n) ? i.save : i, n)) + '\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div class="info-content-wrapper" data-tab="limits">\n\t\t<div class="info-content">\n\t\t\t<form class="form form-horizontal form-inline" id="device_limits_form">\n\t\t\t\t<h4>\n\t\t\t\t\t' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceLimits : i) ? i.limits : i) ? i.title : i, n)) + '\n\t\t\t\t</h4>\n\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="device_limit_data" class="control-label">\n\t\t\t\t\t\t' + u(c(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceLimits : i) ? i.limits : i) ? i.limitDeviceData : i) ? i.label : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n',
        o = null != (o = e.monsterSwitch || (null != n ? n.monsterSwitch : n)) ? o : d,
        r = {
            name: "monsterSwitch",
            hash: {},
            fn: t.program(55, a, 0),
            inverse: t.noop,
            data: a
        },
        i = "function" == typeof o ? o.call(s, r) : o,
        e.monsterSwitch || (i = p.call(n, i, r)),
        null != i && (m += i),
        m += '\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div id="device_limit_data_group">\n\n\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label for="device_blocking_cap" class="control-label">\n\t\t\t\t\t\t\t' + u(c(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceLimits : i) ? i.limits : i) ? i.monthlyDataLimit : i) ? i.label : i, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<input type="text" class="span2 align-right" id="device_blocking_cap" name="device.data.blocking.cap" value="' + u(c(null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.data : i) ? i.blocking : i) ? i.cap : i, n)) + '">\n\t\t\t\t\t\t\t<span class="unit-helper">\n\t\t\t\t\t\t\t\t<span class="unit">\n\t\t\t\t\t\t\t\t\t' + u((o = null != (o = e.unit || (null != n ? n.unit : n)) ? o : d,
        "function" == typeof o ? o.call(s, {
            name: "unit",
            hash: {},
            data: a
        }) : o)) + "\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t" + u(c(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceLimits : i) ? i.limits : i) ? i.monthlyDataLimit : i) ? i.helpText : i, n)) + '\n\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div id="device_blocking_cap_group">\n\n\t\t\t\t\t\t<div class="control-group">\n' + (null != (i = (e.monsterCheckbox || n && n.monsterCheckbox || d).call(s, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceLimits : i) ? i.limits : i) ? i.checkboxes : i) ? i.throttleData : i, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(57, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div id="device_throttling_rate_group">\n\n\t\t\t\t\t\t\t<select name="device.data.throttling.rate" id="device_throttling_rate">\n' + (null != (i = (e.select || n && n.select || d).call(s, null != (i = null != (i = null != (i = null != n ? n.device : n) ? i.data : i) ? i.throttling : i) ? i.rate : i, {
            name: "select",
            hash: {},
            fn: t.program(59, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t\t</select>\n\n\t\t\t\t\t\t\t<div class="slider-container" id="device_slider"></div>\n\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\n\t\t\t\t</div>\n\t\t\t</form>\n\t\t</div>\n\t\t<div class="info-actions">\n\t\t\t<div class="actions pull-right">\n\t\t\t\t<button class="monster-button-cancel cancel">' + u(c(null != (i = null != n ? n.i18n : n) ? i.cancel : i, n)) + '</button>\n\t\t\t\t<button class="monster-button-success save">' + u(c(null != (i = null != n ? n.i18n : n) ? i.saveChanges : i, n)) + '</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div class="info-content-wrapper" data-tab="usage">\n\t\t<div class="info-content">\n\t\t\t<table id="usage_table" class="monster-table no-actions footable">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>' + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceUsage : i) ? i.thead : i) ? i.date : i, n)) + "</th>\n\t\t\t\t\t\t<th>" + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceUsage : i) ? i.thead : i) ? i.time : i, n)) + "</th>\n\t\t\t\t\t\t<th>" + u(c(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.deviceUsage : i) ? i.thead : i) ? i.dataAmount : i, n)) + "</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\t\t\t\t<tbody>\n" + (null != (i = e.each.call(s, null != n ? n.usage : n, {
            name: "each",
            hash: {},
            fn: t.program(62, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</div>\n\t</div>\n",
        o = null != (o = e.isPrivLevelAdmin || (null != n ? n.isPrivLevelAdmin : n)) ? o : d,
        r = {
            name: "isPrivLevelAdmin",
            hash: {},
            fn: t.program(64, a, 0),
            inverse: t.noop,
            data: a
        },
        i = "function" == typeof o ? o.call(s, r) : o,
        e.isPrivLevelAdmin || (i = p.call(n, i, r)),
        null != i && (m += i),
        m + "</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["devices-list"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content tabled-content monster-table-wrapper">\n\t<div class="monster-table-header">\n\t\t<button class="monster-button-primary activate-device">\n\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.buttons : i) ? i.activate : i, n)) + '\n\t\t</button>\n\t\t<button class="monster-button-secondary download-csv">\n\t\t\t<i class="fa fa-download"></i>\n\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.buttons : i) ? i.download : i, n)) + '\n\t\t</button>\n\t</div>\n\t<table class="monster-table footable" id="devices_list" data-filter="#filter">\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<th data-type="html">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.table : i) ? i.headers : i) ? i.model : i, n)) + '</th>\n\t\t\t\t<th data-type="html" data-sorted="true">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.table : i) ? i.headers : i) ? i.name : i, n)) + '</th>\n\t\t\t\t<th data-type="html">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.table : i) ? i.headers : i) ? i.mdn : i, n)) + '</th>\n\t\t\t\t<th data-type="html">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.table : i) ? i.headers : i) ? i.esn : i, n)) + '</th>\n\t\t\t\t<th data-type="html">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.table : i) ? i.headers : i) ? i.usage : i, n)) + '</th>\n\t\t\t\t<th data-type="html" data-sortable="false" data-breakpoints="xs"></th>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n' + (null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.devices : n, {
            name: "each",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t</tbody>\n\t</table>\n</div>\n"
    },
    2: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), s = t.hooks.helperMissing, c = "function", u = t.escapeExpression, d = t.lambda;
        return '\t\t\t<tr class="' + (null != (i = e.if.call(r, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(r, null != n ? n.suspended : n, {
            name: "if",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '" data-mdn="' + u((o = null != (o = e.mdn || (null != n ? n.mdn : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "mdn",
            hash: {},
            data: a
        }) : o)) + '" data-id="' + u((o = null != (o = e.id || (null != n ? n.id : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "id",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t<td data-filter-value="' + u((o = null != (o = e.user_agent || (null != n ? n.user_agent : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "user_agent",
            hash: {},
            data: a
        }) : o)) + " " + u(d(null != (i = null != n ? n.userAgent : n) ? i.name : i, n)) + '" data-sort-value="' + u(d(null != (i = null != n ? n.userAgent : n) ? i.name : i, n)) + '">\n\t\t\t\t\t<div class="cell-content">\n' + (null != (i = (e.compare || n && n.compare || s).call(r, null != (i = null != n ? n.userAgent : n) ? i.name : i, "===", "other", {
            name: "compare",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.program(9, a, 0),
            data: a
        })) ? i : "") + '\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + u((o = null != (o = e.name || (null != n ? n.name : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "name",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t\t<div class="cell-content">\n\t\t\t\t\t\t' + u((o = null != (o = e.name || (null != n ? n.name : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "name",
            hash: {},
            data: a
        }) : o)) + "\n\t\t\t\t\t</div>\n" + (null != (i = (e.compare || n && n.compare || s).call(r, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "error", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = e.if.call(r, null != n ? n.suspended : n, {
            name: "if",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + u((o = null != (o = e.mdn || (null != n ? n.mdn : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "mdn",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t\t<div class="cell-content">\n\t\t\t\t\t\t' + u((e.formatPhoneNumber || n && n.formatPhoneNumber || s).call(r, null != n ? n.mdn : n, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + '\n\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + u((o = null != (o = e.id || (null != n ? n.id : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "id",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t\t<div class="cell-content">\n\t\t\t\t\t\t' + u((o = null != (o = e.id || (null != n ? n.id : n)) ? o : s,
        typeof o === c ? o.call(r, {
            name: "id",
            hash: {},
            data: a
        }) : o)) + '\n\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + u(d(null != (i = null != n ? n.widget : n) ? i.original_usage : i, n)) + '">\n\t\t\t\t\t<div class="usage-widget-container cell-content' + (null != (i = e.if.call(r, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n' + (null != (i = (e.compare || n && n.compare || s).call(r, null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.value : i, "===", 0, {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.program(19, a, 0),
            data: a
        })) ? i : "") + '\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td class="actions">\n\t\t\t\t\t<i class="fa fa-cog action-item edit-device"></i>\n\t\t\t\t\t<i class="fa fa-trash action-item cancel-device"></i>\n\t\t\t\t</td>\n\t\t\t</tr>\n'
    },
    3: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return t.escapeExpression(t.lambda(null != (i = null != n ? n.widget : n) ? i.status : i, n))
    },
    5: function(t, n, e, l, a) {
        return " suspended"
    },
    7: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t\t\t<i class="' + r(o(null != (i = null != (i = null != n ? n.userAgent : n) ? i.info : i) ? i.css : i, n)) + '" data-original-title="' + r(o(null != (i = null != n ? n.model : n) ? i.name : i, n)) + '" data-placement="top" data-toggle="tooltip"></i>\n'
    },
    9: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t\t\t<div class="' + r(o(null != (i = null != (i = null != n ? n.userAgent : n) ? i.info : i) ? i.css : i, n)) + '" data-original-title="' + r(o(null != (i = null != n ? n.model : n) ? i.name : i, n)) + '" data-placement="top" data-toggle="tooltip"></div>\n'
    },
    11: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<div class="label label-important">\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.devicesList) && i.table) && i.labels) && i.dataLimit, n)) + "\n\t\t\t\t\t</div>\n"
    },
    13: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<div class="label label-warning">\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.devicesList) && i.table) && i.labels) && i.suspended, n)) + "\n\t\t\t\t\t</div>\n"
    },
    15: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return " " + t.escapeExpression(t.lambda(null != (i = null != n ? n.widget : n) ? i.status : i, n))
    },
    17: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t\t\t\t\t\t<div class="detail">\n\t\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.unit : i) ? i.symbol : i, n)) + " / " + r(o((i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.misc) && i.usageWidget) && i.unlimited, n)) + "\n\t\t\t\t\t\t</div>\n"
    },
    19: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return (null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.widget : n) ? i.percentage : i, ">", 0, {
            name: "compare",
            hash: {},
            fn: t.program(20, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t<div class="detail">\n\t\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.usage : i) ? i.unit : i) ? i.symbol : i, n)) + " / " + r(o(null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.value : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != n ? n.widget : n) ? i.cap : i) ? i.unit : i) ? i.symbol : i, n)) + " (" + r(o(null != (i = null != n ? n.widget : n) ? i.percentage : i, n)) + "%)\n\t\t\t\t\t\t</div>\n"
    },
    20: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<div class="progress progress-' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.widget : n) ? i.status : i, {
            name: "if",
            hash: {},
            fn: t.program(21, a, 0),
            inverse: t.program(26, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t\t<div class="bar" style="width: ' + t.escapeExpression(t.lambda(null != (i = null != n ? n.widget : n) ? i.percentage : i, n)) + '%"></div>\n\t\t\t\t\t\t</div>\n'
    },
    21: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return (null != (i = (e.compare || n && n.compare || r).call(o, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "error", {
            name: "compare",
            hash: {},
            fn: t.program(22, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != (i = null != n ? n.widget : n) ? i.status : i, "===", "warning", {
            name: "compare",
            hash: {},
            fn: t.program(24, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    22: function(t, n, e, l, a) {
        return "danger"
    },
    24: function(t, n, e, l, a) {
        return "warning"
    },
    26: function(t, n, e, l, a) {
        return "success"
    },
    28: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content tabled-content-empty">\n\t<i class="fa fa-mobile iconography"></i>\n\t<h4 class="title">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.title : i, n)) + '</h4>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.text : i, n)) + '</p>\n\t<button class="monster-button-primary activate-device">' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.devicesList : i) ? i.button : i, n)) + "</button>\n</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != n ? n.devices : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.program(28, a, 0),
            data: a
        })) ? i : ""
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main.faq = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t<div class="accordion-group">\n\t\t\t<div class="accordion-heading">\n\t\t\t\t<a class="accordion-toggle" data-toggle="collapse" data-parent="#faq_accordion" href="#collapse_' + s((i = null != (i = e.key || a && a.key) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "key",
            hash: {},
            data: a
        }) : i)) + '">\n\t\t\t\t\t' + s((i = null != (i = e.question || (null != n ? n.question : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "question",
            hash: {},
            data: a
        }) : i)) + '\n\t\t\t\t</a>\n\t\t\t</div>\n\t\t\t<div id="collapse_' + s((i = null != (i = e.key || a && a.key) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "key",
            hash: {},
            data: a
        }) : i)) + '" class="accordion-body collapse">\n\t\t\t\t<div class="accordion-inner">\n\t\t\t\t\t' + s((i = null != (i = e.answer || (null != n ? n.answer : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "answer",
            hash: {},
            data: a
        }) : i)) + "\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '<div class="app-content faq">\n\t<h3 class="title">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.faq : i) ? i.title : i, n)) + '</h3>\n\t<div class="accordion" id="faq_accordion">\n' + (null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.faq : i) ? i.questions : i, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t</div>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-detail-confirm"] = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return "<div>\n\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.confirm : i) ? i.text1 : i, n)) + "\n\t<br>\n\t" + r(o(null != (i = null != n ? n.status : n) ? i.extended : i, n)) + "\n\t<br>\n\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.confirm : i) ? i.text2 : i, n)) + "\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-detail"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t\t" + t.escapeExpression(t.lambda(null != (i = null != n ? n.targetDevice : n) ? i.name : i, n)) + "\n"
    },
    3: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t\t" + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.unknown : i, n)) + "\n"
    },
    5: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {};
        return '\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t\t' + r(o((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.info) && i.labels) && i.submitted, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<div class="control-text">\n\t\t\t\t\t\t\t\t' + r((e.toFriendlyDate || n && n.toFriendlyDate || t.hooks.helperMissing).call(s, null != n ? n.submission_date : n, {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n" + (null != (i = e.if.call(s, null != n ? n.due_date : n, {
            name: "if",
            hash: {},
            fn: t.program(6, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t\t' + r(o((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.info) && i.labels) && i.submittedBy, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<div class="control-text">\n\t\t\t\t\t\t\t\t' + r(o(null != (i = null != n ? n.additional_properties : n) ? i.submitted_by : i, n)) + "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n"
    },
    6: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.escapeExpression);
        return '\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t\t' + o(t.lambda((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.info) && i.labels) && i.dueDate, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<div class="control-text">\n\t\t\t\t\t\t\t\t' + o((e.toFriendlyDate || n && n.toFriendlyDate || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != n ? n.due_date : n, {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n"
    },
    8: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.lambda, c = t.escapeExpression;
        return '\t\t\t\t\t<div class="node small ' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.program(11, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t<div class="iconography">\n\t\t\t\t\t\t\t<i class="fa fa-circle"></i>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="status">\n\t\t\t\t\t\t\t' + c(s((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.requested, n)) + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="node small ' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.program(13, a, 0),
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t<div class="iconography">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "submitted", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.program(17, a, 0),
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="status">\n\t\t\t\t\t\t\t' + c(s((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.validated, n)) + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="node large ' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "rejected", {
            name: "compare",
            hash: {},
            fn: t.program(19, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "pending", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "scheduled", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "canceled", {
            name: "compare",
            hash: {},
            fn: t.program(21, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t<div class="iconography">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "submitted", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "rejected", {
            name: "compare",
            hash: {},
            fn: t.program(23, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "pending", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "scheduled", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "canceled", {
            name: "compare",
            hash: {},
            fn: t.program(25, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="status">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "rejected", {
            name: "compare",
            hash: {},
            fn: t.program(27, a, 0),
            inverse: t.program(32, a, 0),
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "canceled", {
            name: "compare",
            hash: {},
            fn: t.program(34, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="node large ' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "scheduled", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t<div class="iconography">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "submitted", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "rejected", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "pending", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "scheduled", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "canceled", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="status">\n\t\t\t\t\t\t\t' + c(s((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.scheduled, n)) + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="node ' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '">\n\t\t\t\t\t\t<div class="iconography">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.program(15, a, 0),
            data: a
        })) ? i : "") + '\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="status">\n\t\t\t\t\t\t\t' + c(s((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.completed, n)) + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n"
    },
    9: function(t, n, e, l, a) {
        return "success"
    },
    11: function(t, n, e, l, a) {
        return "in-progress"
    },
    13: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = (e.compare || n && n.compare || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != n ? n.code : n, "!==", "submitted", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    15: function(t, n, e, l, a) {
        return '\t\t\t\t\t\t\t<i class="fa fa-circle-o"></i>\n'
    },
    17: function(t, n, e, l, a) {
        return '\t\t\t\t\t\t\t<i class="fa fa-circle"></i>\n'
    },
    19: function(t, n, e, l, a) {
        return "warning"
    },
    21: function(t, n, e, l, a) {
        return "error"
    },
    23: function(t, n, e, l, a) {
        return '\t\t\t\t\t\t\t<i class="fa fa-exclamation-triangle"></i>\n'
    },
    25: function(t, n, e, l, a) {
        return '\t\t\t\t\t\t\t<i class="fa fa-times-circle-o"></i>\n'
    },
    27: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return '\t\t\t\t\t\t\t<a href="javascript:void(0);" id="edit" class="monster-link">\n\t\t\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.submitted, n)) + "\n" + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.extended : n, "===", "update_sent", {
            name: "compare",
            hash: {},
            fn: t.program(28, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.extended : n, "===", "cancel_sent", {
            name: "compare",
            hash: {},
            fn: t.program(30, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t\t\t\t</a>\n"
    },
    28: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t\t (" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.extendedStatus) && i.updateSent, n)) + ")\n"
    },
    30: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t\t (" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.extendedStatus) && i.cancelSent, n)) + ")\n"
    },
    32: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.submitted, n)) + "\n"
    },
    34: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t<br>\n\t\t\t\t\t\t\t" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.detail) && i.status) && i.steps) && i.canceled, n)) + "\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {};
        return '<div class="app-content detail-view porting-detail">\n\t<div class="info-header-wrapper">\n\t\t<div class="info-header">\n\t\t\t<div class="porting-info">\n\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.header : i, n)) + '\n\t\t\t</div>\n\t\t\t<div class="porting-mdn">\n\t\t\t\t' + r((e.formatPhoneNumber || n && n.formatPhoneNumber || t.hooks.helperMissing).call(s, null != (i = null != n ? n.porting : n) ? i.mdn : i, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + '\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class="info-content-wrapper active" data-tab="info">\n\t\t<div class="info-content row-fluid">\n\t\t\t<div class="span4">\n\t\t\t\t<h4 class="title">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.info : i) ? i.title : i, n)) + '\n\t\t\t\t</h4>\n\t\t\t\t<form class="form-horizontal">\n\t\t\t\t\t<div class="control-group">\n\t\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.info : i) ? i.labels : i) ? i.target : i, n)) + '\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t\t<div class="control-text">\n' + (null != (i = e.if.call(s, null != n ? n.targetDevice : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.program(3, a, 0),
            data: a
        })) ? i : "") + "\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n" + (null != (i = e.with.call(s, null != n ? n.porting : n, {
            name: "with",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</form>\n\t\t\t</div>\n\t\t\t<div class="span7 offset1">\n\t\t\t\t<h4 class="title">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.detail : i) ? i.status : i) ? i.title : i, n)) + '\n\t\t\t\t</h4>\n\t\t\t\t<div class="monster-statuses">\n' + (null != (i = e.with.call(s, null != (i = null != n ? n.porting : n) ? i.status : i, {
            name: "with",
            hash: {},
            fn: t.program(8, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-emptyList"] = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content tabled-content-empty">\n\t<h4 class="title">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.empty : i) ? i.title : i, n)) + '</h4>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.empty : i) ? i.text : i, n)) + '</p>\n\t<button class="monster-button-primary action-button">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.button : i, n)) + "</button>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-list"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.escapeExpression), r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing;
        return '<div class="app-content tabled-content monster-table-wrapper">\n\t<div class="monster-table-header">\n\t\t<button class="monster-button-primary new-port">\n\t\t\t' + o(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.button : i, n)) + '\n\t\t</button>\n\t</div>\n\t<table class="monster-table footable no-actions" id="porting_list">\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<th>\n\t\t\t\t\t' + o((e.toUpperCase || n && n.toUpperCase || s).call(r, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.thead : i) ? i.number : i, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + "\n\t\t\t\t</th>\n\t\t\t\t<th>\n\t\t\t\t\t" + o((e.toUpperCase || n && n.toUpperCase || s).call(r, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.thead : i) ? i.submitted : i, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + "\n\t\t\t\t</th>\n\t\t\t\t<th>\n\t\t\t\t\t" + o((e.toUpperCase || n && n.toUpperCase || s).call(r, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.thead : i) ? i.submittedBy : i, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + '\n\t\t\t\t</th>\n\t\t\t\t<th data-type="html">\n\t\t\t\t\t' + o((e.toUpperCase || n && n.toUpperCase || s).call(r, null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.thead : i) ? i.status : i, {
            name: "toUpperCase",
            hash: {},
            data: a
        })) + "\n\t\t\t\t</th>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n" + (null != (i = e.each.call(r, null != n ? n.ports : n, {
            name: "each",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t</tbody>\n\t</table>\n</div>\n"
    },
    2: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        t.lambda), s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing, d = "function";
        return '\t\t\t<tr class="' + s(r(null != (i = null != n ? n.status : n) ? i.code : i, n)) + '" data-mdn="' + s((o = null != (o = e.mdn || (null != n ? n.mdn : n)) ? o : u,
        typeof o === d ? o.call(c, {
            name: "mdn",
            hash: {},
            data: a
        }) : o)) + '" data-id="' + s((o = null != (o = e.id || (null != n ? n.id : n)) ? o : u,
        typeof o === d ? o.call(c, {
            name: "id",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t<td data-filter-value="' + s((o = null != (o = e.mdn || (null != n ? n.mdn : n)) ? o : u,
        typeof o === d ? o.call(c, {
            name: "mdn",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t\t' + s((e.formatPhoneNumber || n && n.formatPhoneNumber || u).call(c, null != n ? n.mdn : n, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + '\n\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + s((o = null != (o = e.submission_date || (null != n ? n.submission_date : n)) ? o : u,
        typeof o === d ? o.call(c, {
            name: "submission_date",
            hash: {},
            data: a
        }) : o)) + '">\n\t\t\t\t\t' + s((e.toFriendlyDate || n && n.toFriendlyDate || u).call(c, null != n ? n.submission_date : n, {
            name: "toFriendlyDate",
            hash: {},
            data: a
        })) + "\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t" + s(r(null != (i = null != n ? n.additional_properties : n) ? i.submitted_by : i, n)) + '\n\t\t\t\t</td>\n\t\t\t\t<td data-sort-value="' + s((o = null != (o = e.code || (null != n ? n.code : n)) ? o : u,
        typeof o === d ? o.call(c, {
            name: "code",
            hash: {},
            data: a
        }) : o)) + '">\n' + (null != (i = e.with.call(c, null != n ? n.status : n, {
            name: "with",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t</td>\n\t\t\t</tr>\n"
    },
    3: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return '\t\t\t\t\t<a href="javascript:void(0);" class="monster-link detail">\n' + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "submitted", {
            name: "compare",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "rejected", {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "pending", {
            name: "compare",
            hash: {},
            fn: t.program(11, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "scheduled", {
            name: "compare",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "canceled", {
            name: "compare",
            hash: {},
            fn: t.program(15, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.code : n, "===", "completed", {
            name: "compare",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t\t</a>\n"
    },
    4: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing;
        return "\t\t\t\t\t\t" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.submitted, n)) + "\n" + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.extended : n, "===", "update_sent", {
            name: "compare",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.compare || n && n.compare || r).call(o, null != n ? n.extended : n, "===", "cancel_sent", {
            name: "compare",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    5: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t (" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.extendedStatus) && i.updateSent, n)) + ")\n"
    },
    7: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t\t (" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.extendedStatus) && i.cancelSent, n)) + ")\n"
    },
    9: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<i class="icon-telicon-warning"></i>\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.rejected, n)) + "\n"
    },
    11: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.pending, n)) + "\n"
    },
    13: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t" + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.scheduled, n)) + "\n"
    },
    15: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<i class="icon-telicon-x-circled"></i>\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.canceled, n)) + "\n"
    },
    17: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t\t<i class="icon-telicon-check-circle"></i>\n\t\t\t\t\t\t' + t.escapeExpression(t.lambda((i = (i = (i = (i = (i = (i = a && a.root) && i.i18n) && i.mobileApp) && i.porting) && i.list) && i.status) && i.completed, n)) + "\n"
    },
    19: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content tabled-content-empty">\n\t<i class="icon-telicon-porting iconography"></i>\n\t<h4 class="title">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.empty : i) ? i.title : i, n)) + '</h4>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.empty : i) ? i.text : i, n)) + '</p>\n\t<button class="monster-button-primary new-port">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.list : i) ? i.button : i, n)) + "</button>\n</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != n ? n.ports : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.program(19, a, 0),
            data: a
        })) ? i : ""
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-prevalidate"] = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '<div class="app-content esn-check">\n\t<h3 class="title">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.title : i, n)) + '</h3>\n\t<p class="text">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.text : i, n)) + '</p>\n\t<form class="input-container" id="prevalidate_form">\n\t\t<input type="text" id="mdn" name="mdn" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.placeholder : i, n)) + '">\n\t\t<button class="monster-button-primary action-button">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.button : i, n)) + "</button>\n\t</form>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-prevalidateResponse"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return "in"
    },
    3: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t<i class="fa fa-check-circle-o iconography"></i>\n\t<h3 class="title">\n\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.success : i) ? i.title : i, n)) + '\n\t</h3>\n\t<p class="text">\n\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.success : i) ? i.text : i, n)) + '\n\t</p>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel" id="back">\n\t\t\t' + r(o(null != (i = null != n ? n.i18n : n) ? i.cancel : i, n)) + '\n\t\t</button>\n\t\t<button class="monster-button-primary" id="start_port">\n\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.success : i) ? i.button : i, n)) + "\n\t\t</button>\n\t</div>\n"
    },
    5: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression;
        return '\t<i class="fa fa-times-circle-o iconography"></i>\n\t<h3 class="title">\n\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.error : i) ? i.title : i, n)) + '\n\t</h3>\n\t<p class="text">\n\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.prevalidate : i) ? i.error : i) ? i.text : i, n)) + '\n\t</p>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel" id="back">\n\t\t\t' + r(o(null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.misc : i) ? i.back : i, n)) + "\n\t\t</button>\n\t</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {});
        return '<div class="app-content ' + (null != (i = e.unless.call(o, null != n ? n.isValid : n, {
            name: "unless",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + 'valid-response">\n' + (null != (i = e.if.call(o, null != n ? n.isValid : n, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.program(5, a, 0),
            data: a
        })) ? i : "") + "</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["porting-wizard"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t\t<option value="">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.placeholder : i, n)) + "</option>\n" + (null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != n ? n.devices : n, {
            name: "each",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "")
    },
    2: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t\t\t\t\t<option value="' + s((i = null != (i = e.id || (null != n ? n.id : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "id",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.name || (null != n ? n.name : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "name",
            hash: {},
            data: a
        }) : i)) + "</option>\n"
    },
    4: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t" + t.escapeExpression((e.formatPhoneNumber || n && n.formatPhoneNumber || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.porting : n) ? i.mdn : i, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + "\n"
    },
    6: function(t, n, e, l, a) {
        t.propertyIsEnumerable;
        return "\t\t\t\t\t\t" + t.escapeExpression((e.formatPhoneNumber || n && n.formatPhoneNumber || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, null != n ? n.mdn : n, {
            name: "formatPhoneNumber",
            hash: {},
            data: a
        })) + "\n"
    },
    8: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<input type="radio" class="account-type" name="type" value="personal"' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.porting : n) ? i.id : i, {
            name: "if",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.program(10, a, 0),
            data: a
        })) ? i : "") + ">\n"
    },
    9: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.ssn : i, {
            name: "if",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    10: function(t, n, e, l, a) {
        return ' checked="checked"'
    },
    12: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t\t\t<input type="radio" class="account-type" name="type" value="business"' + (null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != n ? n.porting : n) ? i.id : i, {
            name: "if",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + ">\n"
    },
    13: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.tax_id : i, {
            name: "if",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : ""
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {}, c = t.hooks.helperMissing;
        return '<div class="app-content form">\n\t<form class="form form-horizontal form-inline" id="port_wizard_form">\n\t\t<fieldset>\n\t\t\t<legend>\n\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.legend : i, n)) + "\n\t\t\t</legend>\n\n\t\t\t<h4>\n\t\t\t\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.title : i, n)) + "\n\t\t\t</h4>\n\t\t\t<p>\n\t\t\t\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.infoText : i, n)) + '\n\t\t\t</p>\n\t\t\t<div class="select-group">\n\t\t\t\t<select name="global.device_id" id="device_id">\n' + (null != (i = (e.select || n && n.select || c).call(s, null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.device_id : i, {
            name: "select",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t\t</select>\n\t\t\t</div>\n\t\t\t<div id="selected_device_info">\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.labels : i) ? i.currentMdn : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text" id="selected_device_mdn"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.labels : i) ? i.manufacturer : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text" id="selected_device_manufacturer"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label class="control-label">\n\t\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.deviceSelection : i) ? i.labels : i) ? i.model : i, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="control-text" id="selected_device_model"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<h4>\n\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.portInfo : i) ? i.title : i, n)) + '\n\t\t\t</h4>\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.portInfo : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<span class="text">\n' + (null != (i = e.if.call(s, null != (i = null != n ? n.porting : n) ? i.mdn : i, {
            name: "if",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.program(6, a, 0),
            data: a
        })) ? i : "") + "\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<h4>\n\t\t\t\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.title : i, n)) + "\n\t\t\t</h4>\n\t\t\t<p>\n\t\t\t\t" + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.infoText : i, n)) + '\n\t\t\t</p>\n\t\t\t<div class="radio-group">\n' + (null != (i = (e.monsterRadio || n && n.monsterRadio || c).call(s, null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.radioButtons : i) ? i.personal : i, {
            name: "monsterRadio",
            hash: {},
            fn: t.program(8, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + (null != (i = (e.monsterRadio || n && n.monsterRadio || c).call(s, null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.radioButtons : i) ? i.business : i, {
            name: "monsterRadio",
            hash: {},
            fn: t.program(12, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t\t</div>\n\t\t\t<div class="control-group field-business">\n\t\t\t\t<label for="business_name" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.businessName : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" id="business_name" name="business.business_name" value="' + r(o(null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.business_name : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.businessName : i) ? i.placeholder : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group field-business">\n\t\t\t\t<label for="tax_id" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.taxIdentification : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" id="tax_id" name="business.tax_id" value="' + r(o(null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.tax_id : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.taxIdentification : i) ? i.placeholder : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="account_number" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.accountNumber : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" id="account_id" name="global.current_carrier.account_id" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.current_carrier : i) ? i.account_id : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.accountNumber : i) ? i.placeholder : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="password" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.accountPassword : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="password" id="password" name="global.current_carrier.password" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.current_carrier : i) ? i.password : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group field-personal">\n\t\t\t\t<label for="ssn" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.ssn : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls">\n\t\t\t\t\t<input type="text" id="ssn" name="personal.ssn" value="' + r(o(null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.ssn : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.ssn : i) ? i.placeholder : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="subscriber_full_name" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.owner : i) ? i.labelBusiness : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls-list">\n\t\t\t\t\t<input type="text" id="subscriber_full_name" name="global.current_carrier.subscriber_full_name" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.current_carrier : i) ? i.subscriber_full_name : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.owner : i) ? i.placeholders : i) ? i.fullName : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group field-personal">\n\t\t\t\t<label for="bill_firstname" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.owner : i) ? i.labelPersonal : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls-list">\n\t\t\t\t\t<input type="text" id="first_name" name="personal.first_name" value="' + r(o(null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.first_name : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.owner : i) ? i.placeholders : i) ? i.firstname : i, n)) + '">\n\t\t\t\t\t<input type="text" id="last_name" name="personal.last_name" value="' + r(o(null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.last_name : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.owner : i) ? i.placeholders : i) ? i.lastname : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-group">\n\t\t\t\t<label for="street" class="control-label">\n\t\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.label : i, n)) + '\n\t\t\t\t</label>\n\t\t\t\t<div class="controls-list">\n\t\t\t\t\t<input type="text" id="street_number" name="global.address.street_number" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.address : i) ? i.street_number : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.placeholders : i) ? i.streetNumber : i, n)) + '">\n\t\t\t\t\t<input type="text" id="street" name="global.address.street" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.address : i) ? i.street : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.placeholders : i) ? i.street : i, n)) + '">\n\t\t\t\t\t<input type="text" id="postal_code" name="global.address.postal_code" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.address : i) ? i.postal_code : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.placeholders : i) ? i.zipCode : i, n)) + '">\n\t\t\t\t\t<input type="text" id="city" name="global.address.locality" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.address : i) ? i.locality : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.placeholders : i) ? i.city : i, n)) + '">\n\t\t\t\t\t<input type="text" id="state" name="global.address.region" value="' + r(o(null != (i = null != (i = null != (i = null != n ? n.porting : n) ? i.request_data : i) ? i.address : i) ? i.region : i, n)) + '" placeholder="' + r(o(null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.carrierInfo : i) ? i.fields : i) ? i.billingAddress : i) ? i.placeholders : i) ? i.state : i, n)) + '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</fieldset>\n\t</form>\n\t<div class="form-actions">\n\t\t<div class="pull-right">\n\t\t\t<button class="monster-button-cancel" id="cancel">\n\t\t\t\t' + r(o(null != (i = null != n ? n.i18n : n) ? i.cancel : i, n)) + '\n\t\t\t</button>\n\t\t\t<button class="monster-button-success" id="save">\n\t\t\t\t' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.porting : i) ? i.wizard : i) ? i.button : i, n)) + "\n\t\t\t</button>\n\t\t</div>\n\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["provisioning-modelInstructions"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return null != (i = e.if.call(null != n ? n : t.nullContext || {}, null != n ? n.instructions : n, {
            name: "if",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.program(5, a, 0),
            data: a
        })) ? i : ""
    },
    2: function(t, n, e, l, a) {
        var i, o, r = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {});
        return "\t\t\t\t<li>\n\t\t\t\t\t" + t.escapeExpression((o = null != (o = e.label || (null != n ? n.label : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(r, {
            name: "label",
            hash: {},
            data: a
        }) : o)) + '\n\t\t\t\t\t<ol type="a">\n' + (null != (i = e.each.call(r, null != n ? n.instructions : n, {
            name: "each",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t\t\t\t\t</ol>\n\t\t\t\t</li>\n"
    },
    3: function(t, n, e, l, a) {
        return "\t\t\t\t\t\t<li>" + t.escapeExpression(t.lambda(n, n)) + "</li>\n"
    },
    5: function(t, n, e, l, a) {
        return "\t\t\t\t<li>" + t.escapeExpression(t.lambda(n, n)) + "</li>\n"
    },
    7: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '\t\t<button class="monster-button-success done">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.provisioning : i) ? i.buttons : i) ? i.done : i, n)) + "</button>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        t.lambda), r = t.escapeExpression, s = null != n ? n : t.nullContext || {};
        return '<div class="app-content provisioning">\n\t<h3 class="title">' + r(o(null != (i = null != n ? n.model : n) ? i.label : i, n)) + " " + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.provisioning : i) ? i.titles : i) ? i.instructions : i, n)) + '</h3>\n\t<div class="instructions-container">\n\t\t<ol class="provisioning-instructions">\n' + (null != (i = e.each.call(s, null != (i = null != n ? n.model : n) ? i.instructions : i, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + '\t\t</ol>\n\t</div>\n\t<div class="inline-buttons">\n\t\t<button class="monster-button-cancel device-categories">' + r(o(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.provisioning : i) ? i.buttons : i) ? i.back : i, n)) + "</button>\n" + (null != (i = e.if.call(s, null != n ? n.comingFromActivationSuccess : n, {
            name: "if",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t</div>\n</div>"
    },
    useData: !0
}),
this.monster.cache.templates.mobile._main["provisioning-modelsListing"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var i, o = (t.propertyIsEnumerable,
        null != n ? n : t.nullContext || {}), r = t.hooks.helperMissing, s = t.escapeExpression;
        return '\t\t<li><a href="#" class="model-type" data-model="' + s((i = null != (i = e.key || a && a.key) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "key",
            hash: {},
            data: a
        }) : i)) + '">' + s((i = null != (i = e.label || (null != n ? n.label : n)) ? i : r,
        "function" == typeof i ? i.call(o, {
            name: "label",
            hash: {},
            data: a
        }) : i)) + "</a></li>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var i;
        t.propertyIsEnumerable;
        return '<div class="app-content">\n\t<h3 class="title">' + t.escapeExpression(t.lambda(null != (i = null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.provisioning : i) ? i.titles : i) ? i.selectCategory : i, n)) + '</h3>\n\t<ul class="provisioning-models">\n' + (null != (i = e.each.call(null != n ? n : t.nullContext || {}, null != (i = null != (i = null != (i = null != n ? n.i18n : n) ? i.mobileApp : i) ? i.provisioning : i) ? i.categories : i, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a
        })) ? i : "") + "\t</ul>\n</div>"
    },
    useData: !0
});

