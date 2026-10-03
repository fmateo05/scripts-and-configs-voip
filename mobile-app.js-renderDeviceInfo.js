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
    }
