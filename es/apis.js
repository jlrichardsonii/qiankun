import _typeof from "@babel/runtime/helpers/esm/typeof";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _noop from "lodash/noop";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import { __awaiter, __rest } from "tslib";
import { mountRootParcel, registerApplication, start as startSingleSpa } from 'single-spa';
import { loadApp } from './loader';
import { doPrefetchStrategy } from './prefetch';
import { Deferred, getContainer, getXPathForElement, toArray } from './utils';
var microApps = []; // eslint-disable-next-line import/no-mutable-exports

export var frameworkConfiguration = {};
var started = false;
var defaultUrlRerouteOnly = true;
var frameworkStartedDefer = new Deferred();
export function registerMicroApps(apps, lifeCycles) {
  var _this = this;

  // Each app only needs to be registered once
  var unregisteredApps = apps.filter(function (app) {
    return !microApps.some(function (registeredApp) {
      return registeredApp.name === app.name;
    });
  });
  microApps = [].concat(_toConsumableArray(microApps), _toConsumableArray(unregisteredApps));
  unregisteredApps.forEach(function (app) {
    var name = app.name,
        activeRule = app.activeRule,
        _app$loader = app.loader,
        loader = _app$loader === void 0 ? _noop : _app$loader,
        props = app.props,
        appConfig = __rest(app, ["name", "activeRule", "loader", "props"]);

    registerApplication({
      name: name,
      app: function app() {
        return __awaiter(_this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
          var _this2 = this;

          var _a, mount, otherMicroAppConfigs;

          return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  loader(true);
                  _context3.next = 3;
                  return frameworkStartedDefer.promise;

                case 3:
                  _context3.next = 5;
                  return loadApp(Object.assign({
                    name: name,
                    props: props
                  }, appConfig), frameworkConfiguration, lifeCycles);

                case 5:
                  _context3.t0 = _context3.sent;
                  _a = (0, _context3.t0)();
                  mount = _a.mount;
                  otherMicroAppConfigs = __rest(_a, ["mount"]);
                  return _context3.abrupt("return", Object.assign({
                    mount: [function () {
                      return __awaiter(_this2, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
                        return _regeneratorRuntime.wrap(function _callee$(_context) {
                          while (1) {
                            switch (_context.prev = _context.next) {
                              case 0:
                                return _context.abrupt("return", loader(true));

                              case 1:
                              case "end":
                                return _context.stop();
                            }
                          }
                        }, _callee);
                      }));
                    }].concat(_toConsumableArray(toArray(mount)), [function () {
                      return __awaiter(_this2, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
                        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                return _context2.abrupt("return", loader(false));

                              case 1:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2);
                      }));
                    }])
                  }, otherMicroAppConfigs));

                case 10:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));
      },
      activeWhen: activeRule,
      customProps: props
    });
  });
}
var appConfigPromiseGetterMap = new Map();
var containerMicroAppsMap = new Map();
export function loadMicroApp(app, configuration, lifeCycles) {
  var _this3 = this;

  var _a;

  var props = app.props,
      name = app.name;

  var getContainerXpath = function getContainerXpath(container) {
    var containerElement = getContainer(container);

    if (containerElement) {
      return getXPathForElement(containerElement, document);
    }

    return undefined;
  };

  var microApp;

  var wrapParcelConfigForRemount = function wrapParcelConfigForRemount(config) {
    var container = 'container' in app ? app.container : undefined;
    var microAppConfig = config;

    if (container) {
      var xpath = getContainerXpath(container);

      if (xpath) {
        var containerMicroApps = containerMicroAppsMap.get("".concat(name, "-").concat(xpath));

        if (containerMicroApps === null || containerMicroApps === void 0 ? void 0 : containerMicroApps.length) {
          var mount = [function () {
            return __awaiter(_this3, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
              var prevLoadMicroApps, prevLoadMicroAppsWhichNotBroken;
              return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      // While there are multiple micro apps mounted on the same container, we must wait until the prev instances all had unmounted
                      // Otherwise it will lead some concurrent issues
                      prevLoadMicroApps = containerMicroApps.slice(0, containerMicroApps.indexOf(microApp));
                      prevLoadMicroAppsWhichNotBroken = prevLoadMicroApps.filter(function (v) {
                        return v.getStatus() !== 'LOAD_ERROR' && v.getStatus() !== 'SKIP_BECAUSE_BROKEN';
                      });
                      _context4.next = 4;
                      return Promise.all(prevLoadMicroAppsWhichNotBroken.map(function (v) {
                        return v.unmountPromise;
                      }));

                    case 4:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
            }));
          }].concat(_toConsumableArray(toArray(microAppConfig.mount)));
          microAppConfig = Object.assign(Object.assign({}, config), {
            mount: mount
          });
        }
      }
    }

    return Object.assign(Object.assign({}, microAppConfig), {
      // empty bootstrap hook which should not run twice while it calling from cached micro app
      bootstrap: function bootstrap() {
        return Promise.resolve();
      }
    });
  };
  /**
   * using name + container xpath as the micro app instance id,
   * it means if you rendering a micro app to a dom which have been rendered before,
   * the micro app would not load and evaluate its lifecycles again
   */


  var memorizedLoadingFn = function memorizedLoadingFn() {
    return __awaiter(_this3, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
      var userConfiguration, $$cacheLifecycleByAppName, container, parcelConfigGetterPromise, xpath, _parcelConfigGetterPromise, parcelConfigObjectGetterPromise, _xpath;

      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              userConfiguration = configuration !== null && configuration !== void 0 ? configuration : Object.assign(Object.assign({}, frameworkConfiguration), {
                singular: false
              });
              $$cacheLifecycleByAppName = userConfiguration.$$cacheLifecycleByAppName;
              container = 'container' in app ? app.container : undefined;

              if (!container) {
                _context5.next = 23;
                break;
              }

              if (!$$cacheLifecycleByAppName) {
                _context5.next = 13;
                break;
              }

              parcelConfigGetterPromise = appConfigPromiseGetterMap.get(name);

              if (!parcelConfigGetterPromise) {
                _context5.next = 13;
                break;
              }

              _context5.t0 = wrapParcelConfigForRemount;
              _context5.next = 10;
              return parcelConfigGetterPromise;

            case 10:
              _context5.t1 = _context5.sent;
              _context5.t2 = (0, _context5.t1)(container);
              return _context5.abrupt("return", (0, _context5.t0)(_context5.t2));

            case 13:
              xpath = getContainerXpath(container);

              if (!xpath) {
                _context5.next = 23;
                break;
              }

              _parcelConfigGetterPromise = appConfigPromiseGetterMap.get("".concat(name, "-").concat(xpath));

              if (!_parcelConfigGetterPromise) {
                _context5.next = 23;
                break;
              }

              _context5.t3 = wrapParcelConfigForRemount;
              _context5.next = 20;
              return _parcelConfigGetterPromise;

            case 20:
              _context5.t4 = _context5.sent;
              _context5.t5 = (0, _context5.t4)(container);
              return _context5.abrupt("return", (0, _context5.t3)(_context5.t5));

            case 23:
              parcelConfigObjectGetterPromise = loadApp(app, userConfiguration, lifeCycles);

              if (container) {
                if ($$cacheLifecycleByAppName) {
                  appConfigPromiseGetterMap.set(name, parcelConfigObjectGetterPromise);
                } else {
                  _xpath = getContainerXpath(container);
                  if (_xpath) appConfigPromiseGetterMap.set("".concat(name, "-").concat(_xpath), parcelConfigObjectGetterPromise);
                }
              }

              _context5.next = 27;
              return parcelConfigObjectGetterPromise;

            case 27:
              _context5.t6 = _context5.sent;
              return _context5.abrupt("return", (0, _context5.t6)(container));

            case 29:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
  };

  if (!started) {
    // We need to invoke start method of single-spa as the popstate event should be dispatched while the main app calling pushState/replaceState automatically,
    // but in single-spa it will check the start status before it dispatch popstate
    // see https://github.com/single-spa/single-spa/blob/f28b5963be1484583a072c8145ac0b5a28d91235/src/navigation/navigation-events.js#L101
    // ref https://github.com/umijs/qiankun/pull/1071
    startSingleSpa({
      urlRerouteOnly: (_a = frameworkConfiguration.urlRerouteOnly) !== null && _a !== void 0 ? _a : defaultUrlRerouteOnly
    });
  }

  microApp = mountRootParcel(memorizedLoadingFn, Object.assign({
    domElement: document.createElement('div')
  }, props)); // Store the microApps which they mounted on the same container

  var container = 'container' in app ? app.container : undefined;

  if (container) {
    var xpath = getContainerXpath(container);

    if (xpath) {
      var key = "".concat(name, "-").concat(xpath);
      var microAppsRef = containerMicroAppsMap.get(key) || [];
      microAppsRef.push(microApp);
      containerMicroAppsMap.set(key, microAppsRef); // gc after unmount

      microApp.unmountPromise.finally(function () {
        var index = microAppsRef.indexOf(microApp);
        microAppsRef.splice(index, 1); // @ts-ignore

        microApp = null;
      });
    }
  }

  return microApp;
}
export function start() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  frameworkConfiguration = Object.assign({
    prefetch: true,
    singular: true,
    sandbox: true
  }, opts);

  var _frameworkConfigurati = frameworkConfiguration,
      prefetch = _frameworkConfigurati.prefetch,
      sandbox = _frameworkConfigurati.sandbox,
      singular = _frameworkConfigurati.singular,
      _frameworkConfigurati2 = _frameworkConfigurati.urlRerouteOnly,
      urlRerouteOnly = _frameworkConfigurati2 === void 0 ? defaultUrlRerouteOnly : _frameworkConfigurati2,
      importEntryOpts = __rest(frameworkConfiguration, ["prefetch", "sandbox", "singular", "urlRerouteOnly"]);

  if (prefetch) {
    doPrefetchStrategy(microApps, prefetch, importEntryOpts);
  }

  if (sandbox) {
    if (!window.Proxy) {
      console.warn('[qiankun] Miss window.Proxy, proxySandbox will degenerate into snapshotSandbox');
      frameworkConfiguration.sandbox = _typeof(sandbox) === 'object' ? Object.assign(Object.assign({}, sandbox), {
        loose: true
      }) : {
        loose: true
      };

      if (!singular) {
        console.warn('[qiankun] Setting singular as false may cause unexpected behavior while your browser not support window.Proxy');
      }
    }
  }

  startSingleSpa({
    urlRerouteOnly: urlRerouteOnly
  });
  started = true;
  frameworkStartedDefer.resolve();
}