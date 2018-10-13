(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (global){
var web = require('@mitter-io/web');
var core = require('@mitter-io/core');
var getCookie = function(name) {
	var getCookieValues = function(cookie) {
		var cookieArray = cookie.split('=');
		return cookieArray[1].trim();
	};

	var getCookieNames = function(cookie) {
		var cookieArray = cookie.split('=');
		return cookieArray[0].trim();
	};

	var cookies = document.cookie.split(';');
	var cookieValue = cookies.map(getCookieValues)[cookies.map(getCookieNames).indexOf(name)];

	return (cookieValue === undefined) ? null : cookieValue;
};

let mitter;
function initialize(){
    mitter = web.Mitter.forWeb(
        getCookie("applicationId"),
        [function(){}],
        'https://api.mitter.io'
    )
    mitter.setUserAuthorization(getCookie('recipient'))
}
initialize()
let mitter_lib = {};
mitter.subscribeToPayload((payload) => {
    if (core.isNewMessagePayload(payload)) {
        console.log(payload)
    }
})

mitter_lib.send = function(receiver, message){
    let appliedAcls = {
        plusAppliedAcls: [
            "read_message:user("+ mitter.me().identifier+")",
            "read_message:user("+ receiver +")"
        ]
    }
    mitter.clients().messages()
    .sendMessage("xKBPG-TEEQj-xBFy3-CnuWu", {
        senderId: mitter.me(),
        textPayload: message,
        timelineEvents: [
            {
                type: "mitter.mtet.SentTime",
                eventTimeMs: new Date().getTime(),
                subject: mitter.me()
            }
        ],
        appliedAcls: appliedAcls
    })
}

global.mitter = mitter_lib


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@mitter-io/core":3,"@mitter-io/web":4}],3:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
    typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
    (factory((global.mitterCore = {}),global.axios));
}(this, (function (exports,axios) { 'use strict';

    axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var MitterAxiosApiInterceptor = /** @class */ (function () {
        function MitterAxiosApiInterceptor(applicationId, genericInterceptor, mitterApiBaseUrl) {
            this.applicationId = applicationId;
            this.genericInterceptor = genericInterceptor;
            this.mitterApiBaseUrl = mitterApiBaseUrl;
            // tslint:disable-next-line:variable-name
            this.mitterAxiosRequestInterceptor = axios.interceptors.request;
            this.mitterAxiosResponseInterceptor = axios.interceptors.response;
        }
        MitterAxiosApiInterceptor.prototype.requestInterceptor = function (config) {
            if (this.interceptFilter(config.baseURL)) {
                this.genericInterceptor({
                    data: config.data,
                    path: config.url,
                    headers: config.headers,
                    method: config.method
                });
                return config;
            }
            return config;
        };
        MitterAxiosApiInterceptor.prototype.responseInterceptor = function (response) {
            if (this.interceptFilter(response.config.url)) {
                return response;
            }
            else {
                return response;
            }
        };
        MitterAxiosApiInterceptor.prototype.responseErrorInterceptor = function (error) {
            /*
            if (error!!.response!!.status === 401 && error.code === 'claim_rejected') {
                if (this.onTokenExpireExecutor !== undefined) {
                    this.onTokenExpireExecutor()
                }
            }
            */
            return Promise.reject(error);
        };
        MitterAxiosApiInterceptor.prototype.enable = function (axiosInstance) {
            var _this = this;
            if (axiosInstance !== undefined) {
                axiosInstance.interceptors.request.use(function (config) {
                    return _this.requestInterceptor(config);
                });
                axiosInstance.interceptors.response.use(function (response) { return _this.responseInterceptor(response); }, function (error) { return _this.responseErrorInterceptor(error); });
            }
            else {
                this.mitterAxiosRequestInterceptor.use(function (config) {
                    return _this.requestInterceptor(config);
                });
                this.mitterAxiosResponseInterceptor.use(function (response) { return _this.responseInterceptor(response); }, function (error) { return _this.responseErrorInterceptor(error); });
            }
        };
        MitterAxiosApiInterceptor.prototype.disable = function (axiosInstance) {
            if (axiosInstance !== undefined) {
                axiosInstance.interceptors.request.eject(3);
                axiosInstance.interceptors.response.eject(3);
            }
            else {
                this.mitterAxiosRequestInterceptor.eject(1);
                this.mitterAxiosResponseInterceptor.eject(2);
            }
        };
        MitterAxiosApiInterceptor.prototype.interceptFilter = function (url) {
            return url.startsWith(this.mitterApiBaseUrl);
        };
        return MitterAxiosApiInterceptor;
    }());

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var dist = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var TypedAxios = axios.default;
    exports.default = TypedAxios;

    });

    var axios$1 = unwrapExports(dist);

    function clientGenerator() {
        return function (mitterAxiosInterceptionHost) {
            var client = axios$1.create({
                baseURL: mitterAxiosInterceptionHost.mitterApiBaseUrl
            });
            mitterAxiosInterceptionHost.enableAxiosInterceptor(client);
            return client;
        };
    }

    // tslint:disable-next-line:variable-name
    var MitterConstants = {
        // MitterApiUrl: 'https://api.mitter.io',
        MitterApiUrl: 'https://api.mitter.io',
        MitterApiStagingUrl: 'https://api.staging.mitter.io',
        Api: {
            VersionPrefix: '/v1'
        }
    };

    var base = MitterConstants.Api.VersionPrefix + "/channels";
    var ChannelsPaths = {
        GetParticipatedChannelsForMe: MitterConstants.Api.VersionPrefix + "/users/me/channels",
        GetParticipatedChannels: MitterConstants.Api.VersionPrefix + "/users/:userId/channels",
        GetChannels: "" + base,
        GetChannelsById: base + "/:channelId"
    };
    var channelsClientGenerator = clientGenerator();
    var ChannelsClient = /** @class */ (function () {
        function ChannelsClient(mitterAxiosInterceptionHost) {
            this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
            this.channelsAxiosClient = channelsClientGenerator(mitterAxiosInterceptionHost);
        }
        ChannelsClient.prototype.newChannel = function (channel) {
            return this.channelsAxiosClient
                .post('/v1/channels', channel)
                .then(function (x) { return x.data; });
        };
        ChannelsClient.prototype.participatedChannels = function () {
            return this.channelsAxiosClient
                .get('/v1/users/me/channels')
                .then(function (x) { return x.data; });
        };
        return ChannelsClient;
    }());

    var base$1 = MitterConstants.Api.VersionPrefix + "/messages";
    var MessagesPaths = {
        GetMessageById: base$1 + "/:messageId",
        GetMessageInChannel: MitterConstants.Api.VersionPrefix + "/channels/:channelId/messages",
        PostMessageToChannel: MitterConstants.Api.VersionPrefix + "/channels/:channelId/messages"
    };
    var messagesClientGenerator = clientGenerator();
    var MessagesClient = /** @class */ (function () {
        function MessagesClient(mitterAxiosInterceptionHost) {
            this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
            this.messagesAxiosClient = messagesClientGenerator(mitterAxiosInterceptionHost);
        }
        MessagesClient.prototype.sendMessage = function (channelId, message) {
            return this.messagesAxiosClient
                .post("/v1/channels/" + encodeURIComponent(channelId) + "/messages", message)
                .then(function (x) { return x.data; });
        };
        MessagesClient.prototype.getMessages = function (channelId, before, after, limit) {
            if (before === void 0) { before = undefined; }
            if (after === void 0) { after = undefined; }
            if (limit === void 0) { limit = 45; }
            return this.messagesAxiosClient
                .get("/v1/messages/" + channelId + "/messages", {
                params: Object.assign({}, after !== undefined ? { after: after } : {}, before !== undefined ? { before: before } : {}, limit !== undefined ? { limit: limit } : {})
            })
                .then(function (x) { return x.data; });
        };
        return MessagesClient;
    }());

    var base$2 = MitterConstants.Api.VersionPrefix + "/users";
    var UsersPaths = {
        GetMe: base$2 + "/me",
        GetUser: base$2 + "/:userId",
        GetMyScreenName: base$2 + "/me/screenname",
        GetUsersScreenName: base$2 + "/:userIds/screenname"
    };
    var usersClientGenerator = clientGenerator();
    var UsersClient = /** @class */ (function () {
        function UsersClient(mitterAxiosInterceptionHost) {
            this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
            this.usersAxiosClient = usersClientGenerator(mitterAxiosInterceptionHost);
        }
        UsersClient.prototype.getUser = function (userId) {
            return this.usersAxiosClient
                .get("/v1/users/" + userId)
                .then(function (x) { return x.data; });
        };
        UsersClient.prototype.createUser = function (user) {
            return this.usersAxiosClient.post('/v1/users', user).then(function (x) { return x.data; });
        };
        return UsersClient;
    }());

    var userTokensClientGenerator = clientGenerator();
    var UserTokensClient = /** @class */ (function () {
        function UserTokensClient(mitterAxiosInterceptionHost) {
            this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
            this.userTokensAxiosClient = userTokensClientGenerator(mitterAxiosInterceptionHost);
        }
        UserTokensClient.prototype.getUserToken = function (userId) {
            return this.userTokensAxiosClient
                .post("/v1/users/" + userId + "/tokens")
                .then(function (x) { return x.data; });
        };
        return UserTokensClient;
    }());

    var MitterClientSet = /** @class */ (function () {
        function MitterClientSet(mitterAxiosInterceptionHost) {
            this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
            this.cachedClients = {};
        }
        MitterClientSet.prototype.channels = function () {
            return this.client(ChannelsClient);
        };
        MitterClientSet.prototype.messages = function () {
            return this.client(MessagesClient);
        };
        MitterClientSet.prototype.users = function () {
            return this.client(UsersClient);
        };
        MitterClientSet.prototype.userAuth = function () {
            return this.client(UserTokensClient);
        };
        MitterClientSet.prototype.client = function (clientConstructor) {
            if (!(clientConstructor.name in this.cachedClients)) {
                this.cachedClients[clientConstructor.name] = new clientConstructor(this.mitterAxiosInterceptionHost);
            }
            return this.cachedClients[clientConstructor.name];
        };
        return MitterClientSet;
    }());

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        var error = new Error(response.statusText);
        var errorResponse = { response: response };
        var returnErrorResponse = __assign({}, error, errorResponse);
        throw returnErrorResponse;
    }
    var parseJSON = function (response) { return response.json(); };

    function statefulPromise() {
        var _resolve = undefined;
        var _reject = undefined;
        var promise = new Promise(function (resolve, reject) {
            _resolve = resolve;
            _reject = reject;
        });
        promise.resolve = _resolve;
        promise.reject = _reject;
        promise.connect = function (outer) {
            outer.then(function (t) { return _resolve(t); }).catch(function (e) { return _reject(e); });
        };
        return promise;
    }

    // tslint:disable-next-line:no-empty
    var noOp = function () { };

    var SavedDeliveryEndpoints = /** @class */ (function () {
        function SavedDeliveryEndpoints(deliveryEndpoints) {
            if (deliveryEndpoints === void 0) { deliveryEndpoints = {}; }
            this.deliveryEndpoints = deliveryEndpoints;
        }
        return SavedDeliveryEndpoints;
    }());
    var MessagingPipelineDriverHost = /** @class */ (function () {
        function MessagingPipelineDriverHost(pipelineDrivers, mitterContext, kvStore, onAllPipelinesInitialized) {
            if (kvStore === void 0) { kvStore = undefined; }
            if (onAllPipelinesInitialized === void 0) { onAllPipelinesInitialized = function () { }; }
            var _this = this;
            this.mitterContext = mitterContext;
            this.kvStore = kvStore;
            this.onAllPipelinesInitialized = onAllPipelinesInitialized;
            this.savedDeliveryEndpoints = new SavedDeliveryEndpoints();
            this.subscriptions = [];
            if (pipelineDrivers instanceof Array) {
                this.pipelineDrivers = pipelineDrivers;
            }
            else {
                this.pipelineDrivers = [pipelineDrivers];
            }
            this.mitterContext.userAuthorizationAvailable(function () { return _this.refresh(); });
        }
        MessagingPipelineDriverHost.prototype.subscribe = function (messageSink) {
            this.subscriptions.push(messageSink);
        };
        MessagingPipelineDriverHost.prototype.refresh = function () {
            var _this = this;
            this.loadStoredEndpoints().then(function () {
                return _this.initializeMessagingPipelines()
                    .then(function () {
                    _this.onAllPipelinesInitialized();
                })
                    .catch(function (e) {
                    _this.onAllPipelinesInitialized(e);
                });
            });
        };
        MessagingPipelineDriverHost.prototype.loadStoredEndpoints = function () {
            return __awaiter(this, void 0, void 0, function () {
                var savedDeliveryEndpoints;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.savedDeliveryEndpoints = new SavedDeliveryEndpoints();
                            if (this.kvStore === undefined) {
                                console.warn('You are not using a store for persisting delivery endpoints.' +
                                    ' This might cause your users to very quickly hit provisioning limits on their endpoints');
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.kvStore.getItem(MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints)];
                        case 1:
                            savedDeliveryEndpoints = _a.sent();
                            if (savedDeliveryEndpoints !== undefined) {
                                this.savedDeliveryEndpoints = savedDeliveryEndpoints;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        MessagingPipelineDriverHost.prototype.initializeMessagingPipelines = function () {
            return __awaiter(this, void 0, void 0, function () {
                var pipelineInits;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pipelineInits = [];
                            return [4 /*yield*/, this.pipelineDrivers.forEach(function (driver) { return __awaiter(_this, void 0, void 0, function () {
                                    var driverInitialized, driverSpec, _a, initialized, pipelineDriverSpec, ex_1, preProvisionPromise;
                                    var _this = this;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _b.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, driver.initialize(this.mitterContext)];
                                            case 1:
                                                _a = _b.sent(), initialized = _a.initialized, pipelineDriverSpec = _a.pipelineDriverSpec;
                                                driverInitialized = initialized;
                                                pipelineInits.push(driverInitialized);
                                                driverSpec = pipelineDriverSpec;
                                                return [3 /*break*/, 3];
                                            case 2:
                                                ex_1 = _b.sent();
                                                console.log('Unable to initialize pipeline driver', ex_1);
                                                throw ex_1;
                                            case 3:
                                                console.log("Initializing pipeline driver '" + driverSpec.name + "'");
                                                preProvisionPromise = Promise.resolve(undefined);
                                                if (driverSpec.name in this.savedDeliveryEndpoints.deliveryEndpoints) {
                                                    preProvisionPromise = this.syncEndpoint(this.savedDeliveryEndpoints.deliveryEndpoints[driverSpec.name]);
                                                    console.log("Found an endpoint already present for " + driverSpec.name + ". If invalid, it will be re-provisioned");
                                                }
                                                preProvisionPromise.then(function (syncedEndpoint) {
                                                    var operatingEndpoint;
                                                    if (syncedEndpoint === undefined) {
                                                        console.log('The endpoint on sync was determined to be invalid, refreshing');
                                                        operatingEndpoint = driverInitialized
                                                            .then(function () { return driver.getDeliveryEndpoint(); })
                                                            .then(function (deliveryEndpoint) {
                                                            if (deliveryEndpoint !== undefined) {
                                                                _this.registerEndpoint(driverSpec, deliveryEndpoint).then(function (provisionedEndpoint) { return provisionedEndpoint; });
                                                            }
                                                            else {
                                                                return undefined;
                                                            }
                                                        })
                                                            .catch(function (e) {
                                                            console.warn("Could not instantiate pipeline driver " + driverSpec.name, e);
                                                            throw e;
                                                        });
                                                    }
                                                    else {
                                                        console.log('The endpoint on sync was determined to be valid. Continuing with the same');
                                                        operatingEndpoint = Promise.resolve(syncedEndpoint);
                                                    }
                                                    operatingEndpoint.then(function (endpoint) {
                                                        if (endpoint !== undefined) {
                                                            _this.announceSinkForDriver(driver, endpoint, _this.generatePipelineSink(driverSpec));
                                                        }
                                                        else {
                                                            if (driver.pipelineSinkChanged !== undefined) {
                                                                driver.pipelineSinkChanged(_this.generateStatelessPipelineSink(driverSpec));
                                                            }
                                                        }
                                                    });
                                                });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, Promise.all(pipelineInits)];
                    }
                });
            });
        };
        MessagingPipelineDriverHost.prototype.announceSinkForDriver = function (driver, endpoint, pipelineSink) {
            driver.endpointRegistered(pipelineSink, endpoint);
            if (driver.pipelineSinkChanged !== undefined) {
                driver.pipelineSinkChanged(pipelineSink);
            }
        };
        MessagingPipelineDriverHost.prototype.syncEndpoint = function (deliveryEndpoint) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, fetch(this.mitterContext.mitterApiBaseUrl + "/v1/users/me/delivery-endpoints/" + deliveryEndpoint.serializedEndpoint)
                            .then(function (resp) {
                            return resp.json;
                        })
                            .then(function (resp) {
                            return resp;
                        })
                            .catch(function () {
                            return undefined;
                        })];
                });
            });
        };
        MessagingPipelineDriverHost.prototype.registerEndpoint = function (driverSpec, deliveryEndpoint) {
            var _this = this;
            return fetch(this.mitterContext.mitterApiBaseUrl + "/v1/users/me/delivery-endpoints", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryEndpoint)
            })
                .then(function (response) { return response.json; })
                .then(function (endpoint) {
                var _a;
                _this.savedDeliveryEndpoints = new SavedDeliveryEndpoints(Object.assign({}, _this.savedDeliveryEndpoints.deliveryEndpoints, (_a = {},
                    _a[driverSpec.name] = endpoint,
                    _a)));
                _this.syncEndpointsToStore();
                console.log('returning endpoint', endpoint);
                return endpoint;
            });
        };
        MessagingPipelineDriverHost.prototype.syncEndpointsToStore = function () {
            if (this.kvStore === undefined) {
                return;
            }
            this.kvStore
                .setItem(MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints, this.savedDeliveryEndpoints)
                .catch(function (e) { return console.warn('Error syncing delivery endpoints to storage', e); });
        };
        MessagingPipelineDriverHost.prototype.generateStatelessPipelineSink = function (driverSpec) {
            var _this = this;
            return {
                received: function (payload) {
                    _this.consumeNewPayload(driverSpec, payload);
                }
            };
        };
        MessagingPipelineDriverHost.prototype.generatePipelineSink = function (driverSpec) {
            var _this = this;
            return {
                received: function (payload) {
                    _this.consumeNewPayload(driverSpec, payload);
                },
                endpointInvalidated: function (deliveryEndpoint) {
                    _this.invalidateEndpoint(driverSpec, deliveryEndpoint);
                },
                authorizedUserUnavailable: noOp,
                statusUpdate: noOp
            };
        };
        MessagingPipelineDriverHost.prototype.invalidateEndpoint = function (_, __) {
            throw new Error('');
        };
        MessagingPipelineDriverHost.prototype.consumeNewPayload = function (_, payload) {
            this.subscriptions.forEach(function (subscription) { return subscription(payload); });
        };
        // tslint:disable-next-line:variable-name
        MessagingPipelineDriverHost.StoreKeys = {
            SavedDeliveryEndpoints: 'savedDeliveryEndpoints'
        };
        return MessagingPipelineDriverHost;
    }());

    var StandardHeaders = {
        UserAuthorizationHeader: 'X-Issued-Mitter-User-Authorization',
        SudoUserAuthorizationHeader: 'X-Mitter-Sudo-User-Id',
        ApplicationIdHeader: 'X-Mitter-Application-Id',
        AccessKeyHeader: 'X-Mitter-Application-Access-Key',
        AccessKeyAuthorizationHeader: 'Authorization'
    };

    var UserAuthorizationInterceptor = /** @class */ (function () {
        function UserAuthorizationInterceptor(userAuthorizationFetcher, applicationId) {
            if (applicationId === void 0) { applicationId = undefined; }
            this.userAuthorizationFetcher = userAuthorizationFetcher;
            this.applicationId = applicationId;
        }
        UserAuthorizationInterceptor.prototype.getInterceptor = function () {
            var _this = this;
            return function (requestParams) {
                if (!(StandardHeaders.UserAuthorizationHeader in requestParams.headers)) {
                    var userAuthorization = _this.userAuthorizationFetcher();
                    if (userAuthorization !== undefined) {
                        requestParams.headers[StandardHeaders.UserAuthorizationHeader] = [
                            userAuthorization
                        ];
                    }
                    if (_this.applicationId !== undefined) {
                        requestParams.headers[StandardHeaders.ApplicationIdHeader] = [
                            _this.applicationId
                        ];
                    }
                }
            };
        };
        return UserAuthorizationInterceptor;
    }());

    var FetchMode;
    (function (FetchMode) {
        FetchMode[FetchMode["Lazy"] = 0] = "Lazy";
        FetchMode[FetchMode["Eager"] = 1] = "Eager";
    })(FetchMode || (FetchMode = {}));
    var MitterObject = /** @class */ (function () {
        function MitterObject() {
            this.mode = FetchMode.Lazy;
        }
        MitterObject.prototype.init = function (fetchCall, mode) {
            var _this = this;
            if (mode === void 0) { mode = FetchMode.Lazy; }
            this.fetchCall = fetchCall;
            this.mode = mode;
            if (mode === FetchMode.Eager) {
                fetchCall().then(function (ref) {
                    _this._ref = ref;
                });
            }
        };
        MitterObject.prototype.sync = function () {
            var _this = this;
            return this.fetchCall().then(function (it) {
                _this.setRef(it);
                return it;
            });
        };
        MitterObject.prototype.setRef = function (ref) {
            this._ref = ref;
        };
        MitterObject.prototype.proxy = function (key) {
            var _this = this;
            if (this._ref !== undefined) {
                return Promise.resolve(this._ref[key]);
            }
            else {
                return (this.sync()
                    // TODO. we probably need some deadlock prevention mechanism, this can ideally
                    // keep on going on forever
                    .then(function (it) {
                    _this._ref = it;
                    return _this._ref[key];
                }));
            }
        };
        return MitterObject;
    }());

    var MitterUser = /** @class */ (function (_super) {
        __extends(MitterUser, _super);
        function MitterUser(mitter, userId) {
            if (userId === void 0) { userId = undefined; }
            var _this = _super.call(this) || this;
            _this.mitter = mitter;
            if (userId === undefined) {
                _this._userId = 'me';
            }
            else {
                _this._userId = userId;
            }
            _this.usersClient = usersClientGenerator(_this.mitter);
            _this.channelsClient = channelsClientGenerator(_this.mitter);
            _super.prototype.init.call(_this, function () {
                return _this.usersClient
                    .get("/v1/users/" + _this._userId)
                    .then(function (x) { return x.data; });
            });
            return _this;
        }
        Object.defineProperty(MitterUser.prototype, "userId", {
            get: function () {
                return _super.prototype.proxy.call(this, 'userId');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MitterUser.prototype, "systemUser", {
            get: function () {
                return _super.prototype.proxy.call(this, 'systemUser');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MitterUser.prototype, "synthetic", {
            get: function () {
                return _super.prototype.proxy.call(this, 'synthetic');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MitterUser.prototype, "screenName", {
            get: function () {
                return _super.prototype.proxy.call(this, 'screenName');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MitterUser.prototype, "identifier", {
            get: function () {
                return _super.prototype.proxy.call(this, 'identifier');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MitterUser.prototype, "userLocators", {
            get: function () {
                return _super.prototype.proxy.call(this, 'userLocators');
            },
            enumerable: true,
            configurable: true
        });
        MitterUser.prototype.channels = function () {
            this.channelsClient
                .get("/v1/users/" + this._userId + "/channels")
                .then(function (x) { return x.data; });
        };
        return MitterUser;
    }(MitterObject));

    var MitterBase = /** @class */ (function () {
        function MitterBase() {
        }
        MitterBase.prototype.version = function () {
            return '0.5.0';
        };
        MitterBase.prototype.clients = function () {
            return new MitterClientSet(this);
        };
        return MitterBase;
    }());
    var Mitter = /** @class */ (function (_super) {
        __extends(Mitter, _super);
        function Mitter(kvStore, applicationId, mitterApiBaseUrl, onTokenExpireFunctions, mitterInstanceReady, pipelineDrivers, globalHostObject) {
            if (mitterApiBaseUrl === void 0) { mitterApiBaseUrl = MitterConstants.MitterApiUrl; }
            var _this = _super.call(this) || this;
            _this.kvStore = kvStore;
            _this.applicationId = applicationId;
            _this.mitterApiBaseUrl = mitterApiBaseUrl;
            _this.onTokenExpireFunctions = onTokenExpireFunctions;
            _this.cachedUserAuthorization = undefined;
            _this.cachedUserId = undefined;
            _this.mitterAxiosInterceptor = new MitterAxiosApiInterceptor(
            /* the application if */
            _this.applicationId, 
            /* The generic request interceptor to use */
            new UserAuthorizationInterceptor(function () { return _this.cachedUserAuthorization; }, _this.applicationId).getInterceptor(), 
            /* The base url for mitter apis */
            _this.mitterApiBaseUrl);
            _this.subscriptions = [];
            _this.onAuthAvailableSubscribers = [];
            _this.onPipelinesInitialized = statefulPromise();
            _this.messagingPipelineDriverHost = new MessagingPipelineDriverHost(pipelineDrivers, _this, kvStore, function (e) {
                if (e !== undefined) {
                    _this.onPipelinesInitialized.reject(e);
                }
                else {
                    _this.onPipelinesInitialized.resolve();
                }
            });
            _this.messagingPipelineDriverHost.subscribe(function (messagingPayload) {
                return _this.subscriptions.forEach(function (subscription) { return subscription(messagingPayload); });
            });
            globalHostObject._mitter_context = _this;
            return _this;
        }
        Mitter.prototype.userAuthorizationAvailable = function (onAuthAvailable) {
            this.onAuthAvailableSubscribers.push(onAuthAvailable);
        };
        Mitter.prototype.subscribeToPayload = function (subscription) {
            this.subscriptions.push(subscription);
        };
        Mitter.prototype.enableAxiosInterceptor = function (axiosInstance) {
            this.mitterAxiosInterceptor.enable(axiosInstance);
        };
        Mitter.prototype.disableAxiosInterceptor = function (axiosInstance) {
            this.mitterAxiosInterceptor.disable(axiosInstance);
        };
        Mitter.prototype.setUserAuthorization = function (authorizationToken) {
            if (authorizationToken.split('.').length === 3) {
                this.cachedUserId = JSON.parse(atob(authorizationToken.split('.')[1]))['userId'];
            }
            if (this.cachedUserAuthorization === authorizationToken) {
                return;
            }
            this.cachedUserAuthorization = authorizationToken;
            this.announceAuthorizationAvailable();
            this.kvStore
                .setItem(Mitter.StoreKey.UserAuthorizationToken, authorizationToken)
                .catch(function (err) {
                throw new Error("Error storing key " + err);
            });
        };
        Mitter.prototype.getUserAuthorization = function () {
            if (this.cachedUserAuthorization !== undefined) {
                return Promise.resolve(this.cachedUserAuthorization);
            }
            else {
                return this.kvStore.getItem(Mitter.StoreKey.UserAuthorizationToken);
            }
        };
        Mitter.prototype.setUserId = function (userId) {
            if (this.cachedUserId === userId)
                return Promise.resolve();
            return this.kvStore.setItem(Mitter.StoreKey.UserId, userId).catch(function (err) {
                throw new Error("Error storing userId " + err);
            });
        };
        Mitter.prototype.getUserId = function () {
            var _this = this;
            if (this.cachedUserId !== undefined) {
                return Promise.resolve(this.cachedUserId);
            }
            else {
                return this.kvStore.getItem(Mitter.StoreKey.UserId).then(function (userId) {
                    if (userId === undefined) {
                        return _this._me().userId.then(function (fetchedUserId) {
                            return _this.setUserId(fetchedUserId).then(function () { return fetchedUserId; });
                        });
                    }
                    else {
                        return Promise.resolve(userId);
                    }
                });
            }
        };
        Mitter.prototype.onPipelinesInit = function () {
            return this.onPipelinesInitialized;
        };
        // Smart-object values
        Mitter.prototype.me = function () {
            return {
                identifier: this.cachedUserId
            };
        };
        Mitter.prototype._me = function () {
            return new MitterUser(this);
        };
        Mitter.prototype.executeOnTokenExpireFunctions = function () {
            this.onTokenExpireFunctions.forEach(function (onTokenExpire) {
                onTokenExpire();
            });
        };
        Mitter.prototype.announceAuthorizationAvailable = function () {
            this.onAuthAvailableSubscribers.forEach(function (subscriber) { return subscriber(); });
        };
        // tslint:disable-next-line:variable-name
        Mitter.StoreKey = {
            UserAuthorizationToken: 'userAuthorizationToken',
            UserId: 'userId'
        };
        return Mitter;
    }(MitterBase));

    (function (PipelineStatus) {
        PipelineStatus[PipelineStatus["Connected"] = 0] = "Connected";
        PipelineStatus[PipelineStatus["Unavailable"] = 1] = "Unavailable";
        PipelineStatus[PipelineStatus["Disrupted"] = 2] = "Disrupted";
        PipelineStatus[PipelineStatus["ConnectionInProgress"] = 3] = "ConnectionInProgress";
    })(exports.PipelineStatus || (exports.PipelineStatus = {}));

    function generatePipelinePayloadMatcher(payloadType) {
        return function (input) {
            return input['@type'] !== undefined && input['@type'] === payloadType;
        };
    }
    var isNewMessagePayload = generatePipelinePayloadMatcher('new-message-payload');
    var isNewChannelPayload = generatePipelinePayloadMatcher('new-channel-payload');
    var isNewMessageTimelineEventPayload = generatePipelinePayloadMatcher('new-message-timeline-event-payload');
    var isNewChannelTimelineEventPayload = generatePipelinePayloadMatcher('new-channel-timeline-event-payload');
    var isParticipantChangedEventPayload = generatePipelinePayloadMatcher('participant-changed-event-payload');
    var isChannelStreamData = generatePipelinePayloadMatcher('stream-data');
    var isPipelineControlPayload = generatePipelinePayloadMatcher('pipeline-control-payload');

    exports.MitterBase = MitterBase;
    exports.Mitter = Mitter;
    exports.MitterConstants = MitterConstants;
    exports.MitterAxiosApiInterceptor = MitterAxiosApiInterceptor;
    exports.StandardHeaders = StandardHeaders;
    exports.ChannelsPaths = ChannelsPaths;
    exports.channelsClientGenerator = channelsClientGenerator;
    exports.ChannelsClient = ChannelsClient;
    exports.MessagesPaths = MessagesPaths;
    exports.messagesClientGenerator = messagesClientGenerator;
    exports.MessagesClient = MessagesClient;
    exports.UsersPaths = UsersPaths;
    exports.usersClientGenerator = usersClientGenerator;
    exports.UsersClient = UsersClient;
    exports.noOp = noOp;
    exports.checkStatus = checkStatus;
    exports.parseJSON = parseJSON;
    exports.statefulPromise = statefulPromise;
    exports.isNewMessagePayload = isNewMessagePayload;
    exports.isNewChannelPayload = isNewChannelPayload;
    exports.isNewMessageTimelineEventPayload = isNewMessageTimelineEventPayload;
    exports.isNewChannelTimelineEventPayload = isNewChannelTimelineEventPayload;
    exports.isParticipantChangedEventPayload = isParticipantChangedEventPayload;
    exports.isChannelStreamData = isChannelStreamData;
    exports.isPipelineControlPayload = isPipelineControlPayload;

    Object.defineProperty(exports, '__esModule', { value: true });

})));


},{"axios":5}],4:[function(require,module,exports){
(function (global){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('websocket')) :
  typeof define === 'function' && define.amd ? define(['exports', 'websocket'], factory) :
  (factory((global.mitterWeb = {}),global.websocket));
}(this, (function (exports,websocket) { 'use strict';

  websocket = websocket && websocket.hasOwnProperty('default') ? websocket['default'] : websocket;

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  var isBuffer_1 = function (obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
  };

  function isBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
  }

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer_1,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim
  };

  var global$1 = (typeof global !== "undefined" ? global :
              typeof self !== "undefined" ? self :
              typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var process = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    // Note: status is not exposed by XDomainRequest
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
      function resolveURL(url) {
        var href = url;

        if (msie) {
          // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                    urlParsingNode.pathname :
                    '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
      };
    })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
  );

  // btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function E() {
    this.message = 'String contains an invalid character';
  }
  E.prototype = new Error;
  E.prototype.code = 5;
  E.prototype.name = 'InvalidCharacterError';

  function btoa(input) {
    var str = String(input);
    var output = '';
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars;
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new E();
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  var btoa_1 = btoa;

  var cookies = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

    // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
  );

  var btoa$1 = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

  var xhr = function xhrAdapter(config$$1) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config$$1.data;
      var requestHeaders = config$$1.headers;

      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();
      var loadEvent = 'onreadystatechange';
      var xDomain = false;

      // For IE 8/9 CORS support
      // Only supports POST and GET calls and doesn't returns the response headers.
      // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
      if (process.env.NODE_ENV !== 'test' &&
          typeof window !== 'undefined' &&
          window.XDomainRequest && !('withCredentials' in request) &&
          !isURLSameOrigin(config$$1.url)) {
        request = new window.XDomainRequest();
        loadEvent = 'onload';
        xDomain = true;
        request.onprogress = function handleProgress() {};
        request.ontimeout = function handleTimeout() {};
      }

      // HTTP basic authentication
      if (config$$1.auth) {
        var username = config$$1.auth.username || '';
        var password = config$$1.auth.password || '';
        requestHeaders.Authorization = 'Basic ' + btoa$1(username + ':' + password);
      }

      request.open(config$$1.method.toUpperCase(), buildURL(config$$1.url, config$$1.params, config$$1.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config$$1.timeout;

      // Listen for ready state
      request[loadEvent] = function handleLoad() {
        if (!request || (request.readyState !== 4 && !xDomain)) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config$$1.responseType || config$$1.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
          status: request.status === 1223 ? 204 : request.status,
          statusText: request.status === 1223 ? 'No Content' : request.statusText,
          headers: responseHeaders,
          config: config$$1,
          request: request
        };

        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config$$1, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        reject(createError('timeout of ' + config$$1.timeout + 'ms exceeded', config$$1, 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils.isStandardBrowserEnv()) {
        var cookies$$1 = cookies;

        // Add xsrf header
        var xsrfValue = (config$$1.withCredentials || isURLSameOrigin(config$$1.url)) && config$$1.xsrfCookieName ?
            cookies$$1.read(config$$1.xsrfCookieName) :
            undefined;

        if (xsrfValue) {
          requestHeaders[config$$1.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (config$$1.withCredentials) {
        request.withCredentials = true;
      }

      // Add responseType to request if needed
      if (config$$1.responseType) {
        try {
          request.responseType = config$$1.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config$$1.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config$$1.onDownloadProgress === 'function') {
        request.addEventListener('progress', config$$1.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config$$1.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config$$1.onUploadProgress);
      }

      if (config$$1.cancelToken) {
        // Handle cancellation
        config$$1.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }

      if (requestData === undefined) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Content-Type');
      if (utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { /* Ignore */ }
      }
      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };

  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Support baseURL config
    if (config.baseURL && !isAbsoluteURL(config.url)) {
      config.url = combineURLs(config.baseURL, config.url);
    }

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers || {}
    );

    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = utils.merge({
        url: arguments[0]
      }, arguments[1]);
    }

    config = utils.merge(defaults_1, {method: 'get'}, this.defaults, config);
    config.method = config.method.toLowerCase();

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  // Provide aliases for supported request methods
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url
      }));
    };
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Factory for creating new instances
  axios.create = function create(instanceConfig) {
    return createInstance(utils.merge(defaults_1, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var default_1 = axios;
  axios_1.default = default_1;

  var axios$1 = axios_1;

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  var MitterAxiosApiInterceptor = /** @class */ (function () {
      function MitterAxiosApiInterceptor(applicationId, genericInterceptor, mitterApiBaseUrl) {
          this.applicationId = applicationId;
          this.genericInterceptor = genericInterceptor;
          this.mitterApiBaseUrl = mitterApiBaseUrl;
          // tslint:disable-next-line:variable-name
          this.mitterAxiosRequestInterceptor = axios$1.interceptors.request;
          this.mitterAxiosResponseInterceptor = axios$1.interceptors.response;
      }
      MitterAxiosApiInterceptor.prototype.requestInterceptor = function (config) {
          if (this.interceptFilter(config.baseURL)) {
              this.genericInterceptor({
                  data: config.data,
                  path: config.url,
                  headers: config.headers,
                  method: config.method
              });
              return config;
          }
          return config;
      };
      MitterAxiosApiInterceptor.prototype.responseInterceptor = function (response) {
          if (this.interceptFilter(response.config.url)) {
              return response;
          }
          else {
              return response;
          }
      };
      MitterAxiosApiInterceptor.prototype.responseErrorInterceptor = function (error) {
          /*
          if (error!!.response!!.status === 401 && error.code === 'claim_rejected') {
              if (this.onTokenExpireExecutor !== undefined) {
                  this.onTokenExpireExecutor()
              }
          }
          */
          return Promise.reject(error);
      };
      MitterAxiosApiInterceptor.prototype.enable = function (axiosInstance) {
          var _this = this;
          if (axiosInstance !== undefined) {
              axiosInstance.interceptors.request.use(function (config) {
                  return _this.requestInterceptor(config);
              });
              axiosInstance.interceptors.response.use(function (response) { return _this.responseInterceptor(response); }, function (error) { return _this.responseErrorInterceptor(error); });
          }
          else {
              this.mitterAxiosRequestInterceptor.use(function (config) {
                  return _this.requestInterceptor(config);
              });
              this.mitterAxiosResponseInterceptor.use(function (response) { return _this.responseInterceptor(response); }, function (error) { return _this.responseErrorInterceptor(error); });
          }
      };
      MitterAxiosApiInterceptor.prototype.disable = function (axiosInstance) {
          if (axiosInstance !== undefined) {
              axiosInstance.interceptors.request.eject(3);
              axiosInstance.interceptors.response.eject(3);
          }
          else {
              this.mitterAxiosRequestInterceptor.eject(1);
              this.mitterAxiosResponseInterceptor.eject(2);
          }
      };
      MitterAxiosApiInterceptor.prototype.interceptFilter = function (url) {
          return url.startsWith(this.mitterApiBaseUrl);
      };
      return MitterAxiosApiInterceptor;
  }());

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var dist = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });

  var TypedAxios = axios$1.default;
  exports.default = TypedAxios;

  });

  var axios$1$1 = unwrapExports(dist);

  function clientGenerator() {
      return function (mitterAxiosInterceptionHost) {
          var client = axios$1$1.create({
              baseURL: mitterAxiosInterceptionHost.mitterApiBaseUrl
          });
          mitterAxiosInterceptionHost.enableAxiosInterceptor(client);
          return client;
      };
  }

  // tslint:disable-next-line:variable-name
  var MitterConstants = {
      // MitterApiUrl: 'https://api.mitter.io',
      MitterApiUrl: 'https://api.mitter.io',
      MitterApiStagingUrl: 'https://api.staging.mitter.io',
      Api: {
          VersionPrefix: '/v1'
      }
  };
  var channelsClientGenerator = clientGenerator();
  var ChannelsClient = /** @class */ (function () {
      function ChannelsClient(mitterAxiosInterceptionHost) {
          this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
          this.channelsAxiosClient = channelsClientGenerator(mitterAxiosInterceptionHost);
      }
      ChannelsClient.prototype.newChannel = function (channel) {
          return this.channelsAxiosClient
              .post('/v1/channels', channel)
              .then(function (x) { return x.data; });
      };
      ChannelsClient.prototype.participatedChannels = function () {
          return this.channelsAxiosClient
              .get('/v1/users/me/channels')
              .then(function (x) { return x.data; });
      };
      return ChannelsClient;
  }());
  var messagesClientGenerator = clientGenerator();
  var MessagesClient = /** @class */ (function () {
      function MessagesClient(mitterAxiosInterceptionHost) {
          this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
          this.messagesAxiosClient = messagesClientGenerator(mitterAxiosInterceptionHost);
      }
      MessagesClient.prototype.sendMessage = function (channelId, message) {
          return this.messagesAxiosClient
              .post("/v1/channels/" + encodeURIComponent(channelId) + "/messages", message)
              .then(function (x) { return x.data; });
      };
      MessagesClient.prototype.getMessages = function (channelId, before, after, limit) {
          if (before === void 0) { before = undefined; }
          if (after === void 0) { after = undefined; }
          if (limit === void 0) { limit = 45; }
          return this.messagesAxiosClient
              .get("/v1/messages/" + channelId + "/messages", {
              params: Object.assign({}, after !== undefined ? { after: after } : {}, before !== undefined ? { before: before } : {}, limit !== undefined ? { limit: limit } : {})
          })
              .then(function (x) { return x.data; });
      };
      return MessagesClient;
  }());
  var usersClientGenerator = clientGenerator();
  var UsersClient = /** @class */ (function () {
      function UsersClient(mitterAxiosInterceptionHost) {
          this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
          this.usersAxiosClient = usersClientGenerator(mitterAxiosInterceptionHost);
      }
      UsersClient.prototype.getUser = function (userId) {
          return this.usersAxiosClient
              .get("/v1/users/" + userId)
              .then(function (x) { return x.data; });
      };
      UsersClient.prototype.createUser = function (user) {
          return this.usersAxiosClient.post('/v1/users', user).then(function (x) { return x.data; });
      };
      return UsersClient;
  }());

  var userTokensClientGenerator = clientGenerator();
  var UserTokensClient = /** @class */ (function () {
      function UserTokensClient(mitterAxiosInterceptionHost) {
          this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
          this.userTokensAxiosClient = userTokensClientGenerator(mitterAxiosInterceptionHost);
      }
      UserTokensClient.prototype.getUserToken = function (userId) {
          return this.userTokensAxiosClient
              .post("/v1/users/" + userId + "/tokens")
              .then(function (x) { return x.data; });
      };
      return UserTokensClient;
  }());

  var MitterClientSet = /** @class */ (function () {
      function MitterClientSet(mitterAxiosInterceptionHost) {
          this.mitterAxiosInterceptionHost = mitterAxiosInterceptionHost;
          this.cachedClients = {};
      }
      MitterClientSet.prototype.channels = function () {
          return this.client(ChannelsClient);
      };
      MitterClientSet.prototype.messages = function () {
          return this.client(MessagesClient);
      };
      MitterClientSet.prototype.users = function () {
          return this.client(UsersClient);
      };
      MitterClientSet.prototype.userAuth = function () {
          return this.client(UserTokensClient);
      };
      MitterClientSet.prototype.client = function (clientConstructor) {
          if (!(clientConstructor.name in this.cachedClients)) {
              this.cachedClients[clientConstructor.name] = new clientConstructor(this.mitterAxiosInterceptionHost);
          }
          return this.cachedClients[clientConstructor.name];
      };
      return MitterClientSet;
  }());

  function statefulPromise() {
      var _resolve = undefined;
      var _reject = undefined;
      var promise = new Promise(function (resolve, reject) {
          _resolve = resolve;
          _reject = reject;
      });
      promise.resolve = _resolve;
      promise.reject = _reject;
      promise.connect = function (outer) {
          outer.then(function (t) { return _resolve(t); }).catch(function (e) { return _reject(e); });
      };
      return promise;
  }

  // tslint:disable-next-line:no-empty
  var noOp = function () { };

  var SavedDeliveryEndpoints = /** @class */ (function () {
      function SavedDeliveryEndpoints(deliveryEndpoints) {
          if (deliveryEndpoints === void 0) { deliveryEndpoints = {}; }
          this.deliveryEndpoints = deliveryEndpoints;
      }
      return SavedDeliveryEndpoints;
  }());
  var MessagingPipelineDriverHost = /** @class */ (function () {
      function MessagingPipelineDriverHost(pipelineDrivers, mitterContext, kvStore, onAllPipelinesInitialized) {
          if (kvStore === void 0) { kvStore = undefined; }
          if (onAllPipelinesInitialized === void 0) { onAllPipelinesInitialized = function () { }; }
          var _this = this;
          this.mitterContext = mitterContext;
          this.kvStore = kvStore;
          this.onAllPipelinesInitialized = onAllPipelinesInitialized;
          this.savedDeliveryEndpoints = new SavedDeliveryEndpoints();
          this.subscriptions = [];
          if (pipelineDrivers instanceof Array) {
              this.pipelineDrivers = pipelineDrivers;
          }
          else {
              this.pipelineDrivers = [pipelineDrivers];
          }
          this.mitterContext.userAuthorizationAvailable(function () { return _this.refresh(); });
      }
      MessagingPipelineDriverHost.prototype.subscribe = function (messageSink) {
          this.subscriptions.push(messageSink);
      };
      MessagingPipelineDriverHost.prototype.refresh = function () {
          var _this = this;
          this.loadStoredEndpoints().then(function () {
              return _this.initializeMessagingPipelines()
                  .then(function () {
                  _this.onAllPipelinesInitialized();
              })
                  .catch(function (e) {
                  _this.onAllPipelinesInitialized(e);
              });
          });
      };
      MessagingPipelineDriverHost.prototype.loadStoredEndpoints = function () {
          return __awaiter(this, void 0, void 0, function () {
              var savedDeliveryEndpoints;
              return __generator(this, function (_a) {
                  switch (_a.label) {
                      case 0:
                          this.savedDeliveryEndpoints = new SavedDeliveryEndpoints();
                          if (this.kvStore === undefined) {
                              console.warn('You are not using a store for persisting delivery endpoints.' +
                                  ' This might cause your users to very quickly hit provisioning limits on their endpoints');
                              return [2 /*return*/];
                          }
                          return [4 /*yield*/, this.kvStore.getItem(MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints)];
                      case 1:
                          savedDeliveryEndpoints = _a.sent();
                          if (savedDeliveryEndpoints !== undefined) {
                              this.savedDeliveryEndpoints = savedDeliveryEndpoints;
                          }
                          return [2 /*return*/];
                  }
              });
          });
      };
      MessagingPipelineDriverHost.prototype.initializeMessagingPipelines = function () {
          return __awaiter(this, void 0, void 0, function () {
              var pipelineInits;
              var _this = this;
              return __generator(this, function (_a) {
                  switch (_a.label) {
                      case 0:
                          pipelineInits = [];
                          return [4 /*yield*/, this.pipelineDrivers.forEach(function (driver) { return __awaiter(_this, void 0, void 0, function () {
                                  var driverInitialized, driverSpec, _a, initialized, pipelineDriverSpec, ex_1, preProvisionPromise;
                                  var _this = this;
                                  return __generator(this, function (_b) {
                                      switch (_b.label) {
                                          case 0:
                                              _b.trys.push([0, 2, , 3]);
                                              return [4 /*yield*/, driver.initialize(this.mitterContext)];
                                          case 1:
                                              _a = _b.sent(), initialized = _a.initialized, pipelineDriverSpec = _a.pipelineDriverSpec;
                                              driverInitialized = initialized;
                                              pipelineInits.push(driverInitialized);
                                              driverSpec = pipelineDriverSpec;
                                              return [3 /*break*/, 3];
                                          case 2:
                                              ex_1 = _b.sent();
                                              console.log('Unable to initialize pipeline driver', ex_1);
                                              throw ex_1;
                                          case 3:
                                              console.log("Initializing pipeline driver '" + driverSpec.name + "'");
                                              preProvisionPromise = Promise.resolve(undefined);
                                              if (driverSpec.name in this.savedDeliveryEndpoints.deliveryEndpoints) {
                                                  preProvisionPromise = this.syncEndpoint(this.savedDeliveryEndpoints.deliveryEndpoints[driverSpec.name]);
                                                  console.log("Found an endpoint already present for " + driverSpec.name + ". If invalid, it will be re-provisioned");
                                              }
                                              preProvisionPromise.then(function (syncedEndpoint) {
                                                  var operatingEndpoint;
                                                  if (syncedEndpoint === undefined) {
                                                      console.log('The endpoint on sync was determined to be invalid, refreshing');
                                                      operatingEndpoint = driverInitialized
                                                          .then(function () { return driver.getDeliveryEndpoint(); })
                                                          .then(function (deliveryEndpoint) {
                                                          if (deliveryEndpoint !== undefined) {
                                                              _this.registerEndpoint(driverSpec, deliveryEndpoint).then(function (provisionedEndpoint) { return provisionedEndpoint; });
                                                          }
                                                          else {
                                                              return undefined;
                                                          }
                                                      })
                                                          .catch(function (e) {
                                                          console.warn("Could not instantiate pipeline driver " + driverSpec.name, e);
                                                          throw e;
                                                      });
                                                  }
                                                  else {
                                                      console.log('The endpoint on sync was determined to be valid. Continuing with the same');
                                                      operatingEndpoint = Promise.resolve(syncedEndpoint);
                                                  }
                                                  operatingEndpoint.then(function (endpoint) {
                                                      if (endpoint !== undefined) {
                                                          _this.announceSinkForDriver(driver, endpoint, _this.generatePipelineSink(driverSpec));
                                                      }
                                                      else {
                                                          if (driver.pipelineSinkChanged !== undefined) {
                                                              driver.pipelineSinkChanged(_this.generateStatelessPipelineSink(driverSpec));
                                                          }
                                                      }
                                                  });
                                              });
                                              return [2 /*return*/];
                                      }
                                  });
                              }); })];
                      case 1:
                          _a.sent();
                          return [2 /*return*/, Promise.all(pipelineInits)];
                  }
              });
          });
      };
      MessagingPipelineDriverHost.prototype.announceSinkForDriver = function (driver, endpoint, pipelineSink) {
          driver.endpointRegistered(pipelineSink, endpoint);
          if (driver.pipelineSinkChanged !== undefined) {
              driver.pipelineSinkChanged(pipelineSink);
          }
      };
      MessagingPipelineDriverHost.prototype.syncEndpoint = function (deliveryEndpoint) {
          return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                  return [2 /*return*/, fetch(this.mitterContext.mitterApiBaseUrl + "/v1/users/me/delivery-endpoints/" + deliveryEndpoint.serializedEndpoint)
                          .then(function (resp) {
                          return resp.json;
                      })
                          .then(function (resp) {
                          return resp;
                      })
                          .catch(function () {
                          return undefined;
                      })];
              });
          });
      };
      MessagingPipelineDriverHost.prototype.registerEndpoint = function (driverSpec, deliveryEndpoint) {
          var _this = this;
          return fetch(this.mitterContext.mitterApiBaseUrl + "/v1/users/me/delivery-endpoints", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(deliveryEndpoint)
          })
              .then(function (response) { return response.json; })
              .then(function (endpoint) {
              var _a;
              _this.savedDeliveryEndpoints = new SavedDeliveryEndpoints(Object.assign({}, _this.savedDeliveryEndpoints.deliveryEndpoints, (_a = {},
                  _a[driverSpec.name] = endpoint,
                  _a)));
              _this.syncEndpointsToStore();
              console.log('returning endpoint', endpoint);
              return endpoint;
          });
      };
      MessagingPipelineDriverHost.prototype.syncEndpointsToStore = function () {
          if (this.kvStore === undefined) {
              return;
          }
          this.kvStore
              .setItem(MessagingPipelineDriverHost.StoreKeys.SavedDeliveryEndpoints, this.savedDeliveryEndpoints)
              .catch(function (e) { return console.warn('Error syncing delivery endpoints to storage', e); });
      };
      MessagingPipelineDriverHost.prototype.generateStatelessPipelineSink = function (driverSpec) {
          var _this = this;
          return {
              received: function (payload) {
                  _this.consumeNewPayload(driverSpec, payload);
              }
          };
      };
      MessagingPipelineDriverHost.prototype.generatePipelineSink = function (driverSpec) {
          var _this = this;
          return {
              received: function (payload) {
                  _this.consumeNewPayload(driverSpec, payload);
              },
              endpointInvalidated: function (deliveryEndpoint) {
                  _this.invalidateEndpoint(driverSpec, deliveryEndpoint);
              },
              authorizedUserUnavailable: noOp,
              statusUpdate: noOp
          };
      };
      MessagingPipelineDriverHost.prototype.invalidateEndpoint = function (_, __) {
          throw new Error('');
      };
      MessagingPipelineDriverHost.prototype.consumeNewPayload = function (_, payload) {
          this.subscriptions.forEach(function (subscription) { return subscription(payload); });
      };
      // tslint:disable-next-line:variable-name
      MessagingPipelineDriverHost.StoreKeys = {
          SavedDeliveryEndpoints: 'savedDeliveryEndpoints'
      };
      return MessagingPipelineDriverHost;
  }());

  var StandardHeaders = {
      UserAuthorizationHeader: 'X-Issued-Mitter-User-Authorization',
      SudoUserAuthorizationHeader: 'X-Mitter-Sudo-User-Id',
      ApplicationIdHeader: 'X-Mitter-Application-Id',
      AccessKeyHeader: 'X-Mitter-Application-Access-Key',
      AccessKeyAuthorizationHeader: 'Authorization'
  };

  var UserAuthorizationInterceptor = /** @class */ (function () {
      function UserAuthorizationInterceptor(userAuthorizationFetcher, applicationId) {
          if (applicationId === void 0) { applicationId = undefined; }
          this.userAuthorizationFetcher = userAuthorizationFetcher;
          this.applicationId = applicationId;
      }
      UserAuthorizationInterceptor.prototype.getInterceptor = function () {
          var _this = this;
          return function (requestParams) {
              if (!(StandardHeaders.UserAuthorizationHeader in requestParams.headers)) {
                  var userAuthorization = _this.userAuthorizationFetcher();
                  if (userAuthorization !== undefined) {
                      requestParams.headers[StandardHeaders.UserAuthorizationHeader] = [
                          userAuthorization
                      ];
                  }
                  if (_this.applicationId !== undefined) {
                      requestParams.headers[StandardHeaders.ApplicationIdHeader] = [
                          _this.applicationId
                      ];
                  }
              }
          };
      };
      return UserAuthorizationInterceptor;
  }());

  var FetchMode;
  (function (FetchMode) {
      FetchMode[FetchMode["Lazy"] = 0] = "Lazy";
      FetchMode[FetchMode["Eager"] = 1] = "Eager";
  })(FetchMode || (FetchMode = {}));
  var MitterObject = /** @class */ (function () {
      function MitterObject() {
          this.mode = FetchMode.Lazy;
      }
      MitterObject.prototype.init = function (fetchCall, mode) {
          var _this = this;
          if (mode === void 0) { mode = FetchMode.Lazy; }
          this.fetchCall = fetchCall;
          this.mode = mode;
          if (mode === FetchMode.Eager) {
              fetchCall().then(function (ref) {
                  _this._ref = ref;
              });
          }
      };
      MitterObject.prototype.sync = function () {
          var _this = this;
          return this.fetchCall().then(function (it) {
              _this.setRef(it);
              return it;
          });
      };
      MitterObject.prototype.setRef = function (ref) {
          this._ref = ref;
      };
      MitterObject.prototype.proxy = function (key) {
          var _this = this;
          if (this._ref !== undefined) {
              return Promise.resolve(this._ref[key]);
          }
          else {
              return (this.sync()
                  // TODO. we probably need some deadlock prevention mechanism, this can ideally
                  // keep on going on forever
                  .then(function (it) {
                  _this._ref = it;
                  return _this._ref[key];
              }));
          }
      };
      return MitterObject;
  }());

  var MitterUser = /** @class */ (function (_super) {
      __extends(MitterUser, _super);
      function MitterUser(mitter, userId) {
          if (userId === void 0) { userId = undefined; }
          var _this = _super.call(this) || this;
          _this.mitter = mitter;
          if (userId === undefined) {
              _this._userId = 'me';
          }
          else {
              _this._userId = userId;
          }
          _this.usersClient = usersClientGenerator(_this.mitter);
          _this.channelsClient = channelsClientGenerator(_this.mitter);
          _super.prototype.init.call(_this, function () {
              return _this.usersClient
                  .get("/v1/users/" + _this._userId)
                  .then(function (x) { return x.data; });
          });
          return _this;
      }
      Object.defineProperty(MitterUser.prototype, "userId", {
          get: function () {
              return _super.prototype.proxy.call(this, 'userId');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(MitterUser.prototype, "systemUser", {
          get: function () {
              return _super.prototype.proxy.call(this, 'systemUser');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(MitterUser.prototype, "synthetic", {
          get: function () {
              return _super.prototype.proxy.call(this, 'synthetic');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(MitterUser.prototype, "screenName", {
          get: function () {
              return _super.prototype.proxy.call(this, 'screenName');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(MitterUser.prototype, "identifier", {
          get: function () {
              return _super.prototype.proxy.call(this, 'identifier');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(MitterUser.prototype, "userLocators", {
          get: function () {
              return _super.prototype.proxy.call(this, 'userLocators');
          },
          enumerable: true,
          configurable: true
      });
      MitterUser.prototype.channels = function () {
          this.channelsClient
              .get("/v1/users/" + this._userId + "/channels")
              .then(function (x) { return x.data; });
      };
      return MitterUser;
  }(MitterObject));

  var MitterBase = /** @class */ (function () {
      function MitterBase() {
      }
      MitterBase.prototype.version = function () {
          return '0.5.0';
      };
      MitterBase.prototype.clients = function () {
          return new MitterClientSet(this);
      };
      return MitterBase;
  }());
  var Mitter = /** @class */ (function (_super) {
      __extends(Mitter, _super);
      function Mitter(kvStore, applicationId, mitterApiBaseUrl, onTokenExpireFunctions, mitterInstanceReady, pipelineDrivers, globalHostObject) {
          if (mitterApiBaseUrl === void 0) { mitterApiBaseUrl = MitterConstants.MitterApiUrl; }
          var _this = _super.call(this) || this;
          _this.kvStore = kvStore;
          _this.applicationId = applicationId;
          _this.mitterApiBaseUrl = mitterApiBaseUrl;
          _this.onTokenExpireFunctions = onTokenExpireFunctions;
          _this.cachedUserAuthorization = undefined;
          _this.cachedUserId = undefined;
          _this.mitterAxiosInterceptor = new MitterAxiosApiInterceptor(
          /* the application if */
          _this.applicationId, 
          /* The generic request interceptor to use */
          new UserAuthorizationInterceptor(function () { return _this.cachedUserAuthorization; }, _this.applicationId).getInterceptor(), 
          /* The base url for mitter apis */
          _this.mitterApiBaseUrl);
          _this.subscriptions = [];
          _this.onAuthAvailableSubscribers = [];
          _this.onPipelinesInitialized = statefulPromise();
          _this.messagingPipelineDriverHost = new MessagingPipelineDriverHost(pipelineDrivers, _this, kvStore, function (e) {
              if (e !== undefined) {
                  _this.onPipelinesInitialized.reject(e);
              }
              else {
                  _this.onPipelinesInitialized.resolve();
              }
          });
          _this.messagingPipelineDriverHost.subscribe(function (messagingPayload) {
              return _this.subscriptions.forEach(function (subscription) { return subscription(messagingPayload); });
          });
          globalHostObject._mitter_context = _this;
          return _this;
      }
      Mitter.prototype.userAuthorizationAvailable = function (onAuthAvailable) {
          this.onAuthAvailableSubscribers.push(onAuthAvailable);
      };
      Mitter.prototype.subscribeToPayload = function (subscription) {
          this.subscriptions.push(subscription);
      };
      Mitter.prototype.enableAxiosInterceptor = function (axiosInstance) {
          this.mitterAxiosInterceptor.enable(axiosInstance);
      };
      Mitter.prototype.disableAxiosInterceptor = function (axiosInstance) {
          this.mitterAxiosInterceptor.disable(axiosInstance);
      };
      Mitter.prototype.setUserAuthorization = function (authorizationToken) {
          if (authorizationToken.split('.').length === 3) {
              this.cachedUserId = JSON.parse(atob(authorizationToken.split('.')[1]))['userId'];
          }
          if (this.cachedUserAuthorization === authorizationToken) {
              return;
          }
          this.cachedUserAuthorization = authorizationToken;
          this.announceAuthorizationAvailable();
          this.kvStore
              .setItem(Mitter.StoreKey.UserAuthorizationToken, authorizationToken)
              .catch(function (err) {
              throw new Error("Error storing key " + err);
          });
      };
      Mitter.prototype.getUserAuthorization = function () {
          if (this.cachedUserAuthorization !== undefined) {
              return Promise.resolve(this.cachedUserAuthorization);
          }
          else {
              return this.kvStore.getItem(Mitter.StoreKey.UserAuthorizationToken);
          }
      };
      Mitter.prototype.setUserId = function (userId) {
          if (this.cachedUserId === userId)
              return Promise.resolve();
          return this.kvStore.setItem(Mitter.StoreKey.UserId, userId).catch(function (err) {
              throw new Error("Error storing userId " + err);
          });
      };
      Mitter.prototype.getUserId = function () {
          var _this = this;
          if (this.cachedUserId !== undefined) {
              return Promise.resolve(this.cachedUserId);
          }
          else {
              return this.kvStore.getItem(Mitter.StoreKey.UserId).then(function (userId) {
                  if (userId === undefined) {
                      return _this._me().userId.then(function (fetchedUserId) {
                          return _this.setUserId(fetchedUserId).then(function () { return fetchedUserId; });
                      });
                  }
                  else {
                      return Promise.resolve(userId);
                  }
              });
          }
      };
      Mitter.prototype.onPipelinesInit = function () {
          return this.onPipelinesInitialized;
      };
      // Smart-object values
      Mitter.prototype.me = function () {
          return {
              identifier: this.cachedUserId
          };
      };
      Mitter.prototype._me = function () {
          return new MitterUser(this);
      };
      Mitter.prototype.executeOnTokenExpireFunctions = function () {
          this.onTokenExpireFunctions.forEach(function (onTokenExpire) {
              onTokenExpire();
          });
      };
      Mitter.prototype.announceAuthorizationAvailable = function () {
          this.onAuthAvailableSubscribers.forEach(function (subscriber) { return subscriber(); });
      };
      // tslint:disable-next-line:variable-name
      Mitter.StoreKey = {
          UserAuthorizationToken: 'userAuthorizationToken',
          UserId: 'userId'
      };
      return Mitter;
  }(MitterBase));

  var PipelineStatus;
  (function (PipelineStatus) {
      PipelineStatus[PipelineStatus["Connected"] = 0] = "Connected";
      PipelineStatus[PipelineStatus["Unavailable"] = 1] = "Unavailable";
      PipelineStatus[PipelineStatus["Disrupted"] = 2] = "Disrupted";
      PipelineStatus[PipelineStatus["ConnectionInProgress"] = 3] = "ConnectionInProgress";
  })(PipelineStatus || (PipelineStatus = {}));

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter$1(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator$1(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  var KvStore = /** @class */ (function () {
      function KvStore() {
      }
      KvStore.prototype.getItem = function (key) {
          return __awaiter$1(this, void 0, void 0, function () {
              var item;
              return __generator$1(this, function (_a) {
                  item = localStorage.getItem(key);
                  if (item === null) {
                      return [2 /*return*/, undefined];
                  }
                  return [2 /*return*/, JSON.parse(item)];
              });
          });
      };
      KvStore.prototype.setItem = function (key, value) {
          return __awaiter$1(this, void 0, void 0, function () {
              return __generator$1(this, function (_a) {
                  localStorage.setItem(key, JSON.stringify(value));
                  return [2 /*return*/];
              });
          });
      };
      KvStore.prototype.removeItem = function (key) {
          return __awaiter$1(this, void 0, void 0, function () {
              return __generator$1(this, function (_a) {
                  localStorage.removeItem(key);
                  return [2 /*return*/];
              });
          });
      };
      return KvStore;
  }());

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule$1(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var browserCrypto = createCommonjsModule$1(function (module) {

  if (commonjsGlobal.crypto && commonjsGlobal.crypto.getRandomValues) {
    module.exports.randomBytes = function(length) {
      var bytes = new Uint8Array(length);
      commonjsGlobal.crypto.getRandomValues(bytes);
      return bytes;
    };
  } else {
    module.exports.randomBytes = function(length) {
      var bytes = new Array(length);
      for (var i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    };
  }
  });
  var browserCrypto_1 = browserCrypto.randomBytes;

  /* global crypto:true */


  // This string has length 32, a power of 2, so the modulus doesn't introduce a
  // bias.
  var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
  var random = {
    string: function(length) {
      var max = _randomStringChars.length;
      var bytes = browserCrypto.randomBytes(length);
      var ret = [];
      for (var i = 0; i < length; i++) {
        ret.push(_randomStringChars.substr(bytes[i] % max, 1));
      }
      return ret.join('');
    }

  , number: function(max) {
      return Math.floor(Math.random() * max);
    }

  , numberString: function(max) {
      var t = ('' + (max - 1)).length;
      var p = new Array(t + 1).join('0');
      return (p + this.number(max)).slice(-t);
    }
  };

  var event = createCommonjsModule$1(function (module) {



  var onUnload = {}
    , afterUnload = false
      // detect google chrome packaged apps because they don't allow the 'unload' event
    , isChromePackagedApp = commonjsGlobal.chrome && commonjsGlobal.chrome.app && commonjsGlobal.chrome.app.runtime
    ;

  module.exports = {
    attachEvent: function(event, listener) {
      if (typeof commonjsGlobal.addEventListener !== 'undefined') {
        commonjsGlobal.addEventListener(event, listener, false);
      } else if (commonjsGlobal.document && commonjsGlobal.attachEvent) {
        // IE quirks.
        // According to: http://stevesouders.com/misc/test-postmessage.php
        // the message gets delivered only to 'document', not 'window'.
        commonjsGlobal.document.attachEvent('on' + event, listener);
        // I get 'window' for ie8.
        commonjsGlobal.attachEvent('on' + event, listener);
      }
    }

  , detachEvent: function(event, listener) {
      if (typeof commonjsGlobal.addEventListener !== 'undefined') {
        commonjsGlobal.removeEventListener(event, listener, false);
      } else if (commonjsGlobal.document && commonjsGlobal.detachEvent) {
        commonjsGlobal.document.detachEvent('on' + event, listener);
        commonjsGlobal.detachEvent('on' + event, listener);
      }
    }

  , unloadAdd: function(listener) {
      if (isChromePackagedApp) {
        return null;
      }

      var ref = random.string(8);
      onUnload[ref] = listener;
      if (afterUnload) {
        setTimeout(this.triggerUnloadCallbacks, 0);
      }
      return ref;
    }

  , unloadDel: function(ref) {
      if (ref in onUnload) {
        delete onUnload[ref];
      }
    }

  , triggerUnloadCallbacks: function() {
      for (var ref in onUnload) {
        onUnload[ref]();
        delete onUnload[ref];
      }
    }
  };

  var unloadTriggered = function() {
    if (afterUnload) {
      return;
    }
    afterUnload = true;
    module.exports.triggerUnloadCallbacks();
  };

  // 'unload' alone is not reliable in opera within an iframe, but we
  // can't use `beforeunload` as IE fires it on javascript: links.
  if (!isChromePackagedApp) {
    module.exports.attachEvent('unload', unloadTriggered);
  }
  });
  var event_1 = event.attachEvent;
  var event_2 = event.detachEvent;
  var event_3 = event.unloadAdd;
  var event_4 = event.unloadDel;
  var event_5 = event.triggerUnloadCallbacks;

  /**
   * Check if we're required to add a port number.
   *
   * @see https://url.spec.whatwg.org/#default-port
   * @param {Number|String} port Port number we need to check
   * @param {String} protocol Protocol we need to check against.
   * @returns {Boolean} Is it a default port for the given protocol
   * @api private
   */
  var requiresPort = function required(port, protocol) {
    protocol = protocol.split(':')[0];
    port = +port;

    if (!port) return false;

    switch (protocol) {
      case 'http':
      case 'ws':
      return port !== 80;

      case 'https':
      case 'wss':
      return port !== 443;

      case 'ftp':
      return port !== 21;

      case 'gopher':
      return port !== 70;

      case 'file':
      return false;
    }

    return port !== 0;
  };

  var has = Object.prototype.hasOwnProperty;

  /**
   * Decode a URI encoded string.
   *
   * @param {String} input The URI encoded string.
   * @returns {String} The decoded string.
   * @api private
   */
  function decode(input) {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  }

  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */
  function querystring(query) {
    var parser = /([^=?&]+)=?([^&]*)/g
      , result = {}
      , part;

    while (part = parser.exec(query)) {
      var key = decode(part[1])
        , value = decode(part[2]);

      //
      // Prevent overriding of existing properties. This ensures that build-in
      // methods like `toString` or __proto__ are not overriden by malicious
      // querystrings.
      //
      if (key in result) continue;
      result[key] = value;
    }

    return result;
  }

  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */
  function querystringify(obj, prefix) {
    prefix = prefix || '';

    var pairs = [];

    //
    // Optionally prefix with a '?' if needed
    //
    if ('string' !== typeof prefix) prefix = '?';

    for (var key in obj) {
      if (has.call(obj, key)) {
        pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
      }
    }

    return pairs.length ? prefix + pairs.join('&') : '';
  }

  //
  // Expose the module.
  //
  var stringify = querystringify;
  var parse = querystring;

  var querystringify_1 = {
  	stringify: stringify,
  	parse: parse
  };

  var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
    , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

  /**
   * These are the parse rules for the URL parser, it informs the parser
   * about:
   *
   * 0. The char it Needs to parse, if it's a string it should be done using
   *    indexOf, RegExp using exec and NaN means set as current value.
   * 1. The property we should set when parsing this value.
   * 2. Indication if it's backwards or forward parsing, when set as number it's
   *    the value of extra chars that should be split off.
   * 3. Inherit from location if non existing in the parser.
   * 4. `toLowerCase` the resulting value.
   */
  var rules = [
    ['#', 'hash'],                        // Extract from the back.
    ['?', 'query'],                       // Extract from the back.
    function sanitize(address) {          // Sanitize what is left of the address
      return address.replace('\\', '/');
    },
    ['/', 'pathname'],                    // Extract from the back.
    ['@', 'auth', 1],                     // Extract from the front.
    [NaN, 'host', undefined, 1, 1],       // Set left over value.
    [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
    [NaN, 'hostname', undefined, 1, 1]    // Set left over.
  ];

  /**
   * These properties should not be copied or inherited from. This is only needed
   * for all non blob URL's as a blob URL does not include a hash, only the
   * origin.
   *
   * @type {Object}
   * @private
   */
  var ignore = { hash: 1, query: 1 };

  /**
   * The location object differs when your code is loaded through a normal page,
   * Worker or through a worker using a blob. And with the blobble begins the
   * trouble as the location object will contain the URL of the blob, not the
   * location of the page where our code is loaded in. The actual origin is
   * encoded in the `pathname` so we can thankfully generate a good "default"
   * location from it so we can generate proper relative URL's again.
   *
   * @param {Object|String} loc Optional default location object.
   * @returns {Object} lolcation object.
   * @public
   */
  function lolcation(loc) {
    var location = commonjsGlobal && commonjsGlobal.location || {};
    loc = loc || location;

    var finaldestination = {}
      , type = typeof loc
      , key;

    if ('blob:' === loc.protocol) {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if ('string' === type) {
      finaldestination = new Url(loc, {});
      for (key in ignore) delete finaldestination[key];
    } else if ('object' === type) {
      for (key in loc) {
        if (key in ignore) continue;
        finaldestination[key] = loc[key];
      }

      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }

    return finaldestination;
  }

  /**
   * @typedef ProtocolExtract
   * @type Object
   * @property {String} protocol Protocol matched in the URL, in lowercase.
   * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
   * @property {String} rest Rest of the URL that is not part of the protocol.
   */

  /**
   * Extract protocol information from a URL with/without double slash ("//").
   *
   * @param {String} address URL we want to extract from.
   * @return {ProtocolExtract} Extracted information.
   * @private
   */
  function extractProtocol(address) {
    var match = protocolre.exec(address);

    return {
      protocol: match[1] ? match[1].toLowerCase() : '',
      slashes: !!match[2],
      rest: match[3]
    };
  }

  /**
   * Resolve a relative URL pathname against a base URL pathname.
   *
   * @param {String} relative Pathname of the relative URL.
   * @param {String} base Pathname of the base URL.
   * @return {String} Resolved pathname.
   * @private
   */
  function resolve(relative, base) {
    var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
      , i = path.length
      , last = path[i - 1]
      , unshift = false
      , up = 0;

    while (i--) {
      if (path[i] === '.') {
        path.splice(i, 1);
      } else if (path[i] === '..') {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0) unshift = true;
        path.splice(i, 1);
        up--;
      }
    }

    if (unshift) path.unshift('');
    if (last === '.' || last === '..') path.push('');

    return path.join('/');
  }

  /**
   * The actual URL instance. Instead of returning an object we've opted-in to
   * create an actual constructor as it's much more memory efficient and
   * faster and it pleases my OCD.
   *
   * It is worth noting that we should not use `URL` as class name to prevent
   * clashes with the global URL instance that got introduced in browsers.
   *
   * @constructor
   * @param {String} address URL we want to parse.
   * @param {Object|String} location Location defaults for relative paths.
   * @param {Boolean|Function} parser Parser for the query string.
   * @private
   */
  function Url(address, location, parser) {
    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }

    var relative, extracted, parse, instruction, index, key
      , instructions = rules.slice()
      , type = typeof location
      , url = this
      , i = 0;

    //
    // The following if statements allows this module two have compatibility with
    // 2 different API:
    //
    // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
    //    where the boolean indicates that the query string should also be parsed.
    //
    // 2. The `URL` interface of the browser which accepts a URL, object as
    //    arguments. The supplied object will be used as default values / fall-back
    //    for relative paths.
    //
    if ('object' !== type && 'string' !== type) {
      parser = location;
      location = null;
    }

    if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

    location = lolcation(location);

    //
    // Extract protocol information before running the instructions.
    //
    extracted = extractProtocol(address || '');
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || '';
    address = extracted.rest;

    //
    // When the authority component is absent the URL starts with a path
    // component.
    //
    if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

    for (; i < instructions.length; i++) {
      instruction = instructions[i];

      if (typeof instruction === 'function') {
        address = instruction(address);
        continue;
      }

      parse = instruction[0];
      key = instruction[1];

      if (parse !== parse) {
        url[key] = address;
      } else if ('string' === typeof parse) {
        if (~(index = address.indexOf(parse))) {
          if ('number' === typeof instruction[2]) {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if ((index = parse.exec(address))) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }

      url[key] = url[key] || (
        relative && instruction[3] ? location[key] || '' : ''
      );

      //
      // Hostname, host and protocol should be lowercased so they can be used to
      // create a proper `origin`.
      //
      if (instruction[4]) url[key] = url[key].toLowerCase();
    }

    //
    // Also parse the supplied query string in to an object. If we're supplied
    // with a custom parser as function use that instead of the default build-in
    // parser.
    //
    if (parser) url.query = parser(url.query);

    //
    // If the URL is relative, resolve the pathname against the base URL.
    //
    if (
        relative
      && location.slashes
      && url.pathname.charAt(0) !== '/'
      && (url.pathname !== '' || location.pathname !== '')
    ) {
      url.pathname = resolve(url.pathname, location.pathname);
    }

    //
    // We should not add port numbers if they are already the default port number
    // for a given protocol. As the host also contains the port number we're going
    // override it with the hostname which contains no port number.
    //
    if (!requiresPort(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = '';
    }

    //
    // Parse down the `auth` for the username and password.
    //
    url.username = url.password = '';
    if (url.auth) {
      instruction = url.auth.split(':');
      url.username = instruction[0] || '';
      url.password = instruction[1] || '';
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:'
      ? url.protocol +'//'+ url.host
      : 'null';

    //
    // The href is just the compiled result.
    //
    url.href = url.toString();
  }

  /**
   * This is convenience method for changing properties in the URL instance to
   * insure that they all propagate correctly.
   *
   * @param {String} part          Property we need to adjust.
   * @param {Mixed} value          The newly assigned value.
   * @param {Boolean|Function} fn  When setting the query, it will be the function
   *                               used to parse the query.
   *                               When setting the protocol, double slash will be
   *                               removed from the final url if it is true.
   * @returns {URL} URL instance for chaining.
   * @public
   */
  function set(part, value, fn) {
    var url = this;

    switch (part) {
      case 'query':
        if ('string' === typeof value && value.length) {
          value = (fn || querystringify_1.parse)(value);
        }

        url[part] = value;
        break;

      case 'port':
        url[part] = value;

        if (!requiresPort(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = '';
        } else if (value) {
          url.host = url.hostname +':'+ value;
        }

        break;

      case 'hostname':
        url[part] = value;

        if (url.port) value += ':'+ url.port;
        url.host = value;
        break;

      case 'host':
        url[part] = value;

        if (/:\d+$/.test(value)) {
          value = value.split(':');
          url.port = value.pop();
          url.hostname = value.join(':');
        } else {
          url.hostname = value;
          url.port = '';
        }

        break;

      case 'protocol':
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;

      case 'pathname':
      case 'hash':
        if (value) {
          var char = part === 'pathname' ? '/' : '#';
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;

      default:
        url[part] = value;
    }

    for (var i = 0; i < rules.length; i++) {
      var ins = rules[i];

      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:'
      ? url.protocol +'//'+ url.host
      : 'null';

    url.href = url.toString();

    return url;
  }

  /**
   * Transform the properties back in to a valid and full URL string.
   *
   * @param {Function} stringify Optional query stringify function.
   * @returns {String} Compiled version of the URL.
   * @public
   */
  function toString$1(stringify) {
    if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

    var query
      , url = this
      , protocol = url.protocol;

    if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

    var result = protocol + (url.slashes ? '//' : '');

    if (url.username) {
      result += url.username;
      if (url.password) result += ':'+ url.password;
      result += '@';
    }

    result += url.host + url.pathname;

    query = 'object' === typeof url.query ? stringify(url.query) : url.query;
    if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

    if (url.hash) result += url.hash;

    return result;
  }

  Url.prototype = { set: set, toString: toString$1 };

  //
  // Expose the URL parser and some additional properties that might be useful for
  // others or testing.
  //
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.qs = querystringify_1;

  var urlParse = Url;

  /**
   * Helpers.
   */

  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} [options]
   * @throws {Error} throw an error if val is not a non-empty string or a number
   * @return {String|Number}
   * @api public
   */

  var ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
      return parse$1(val);
    } else if (type === 'number' && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
        JSON.stringify(val)
    );
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse$1(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y;
      case 'days':
      case 'day':
      case 'd':
        return n * d;
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h;
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m;
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s;
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n;
      default:
        return undefined;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtShort(ms) {
    if (ms >= d) {
      return Math.round(ms / d) + 'd';
    }
    if (ms >= h) {
      return Math.round(ms / h) + 'h';
    }
    if (ms >= m) {
      return Math.round(ms / m) + 'm';
    }
    if (ms >= s) {
      return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtLong(ms) {
    return plural(ms, d, 'day') ||
      plural(ms, h, 'hour') ||
      plural(ms, m, 'minute') ||
      plural(ms, s, 'second') ||
      ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural(ms, n, name) {
    if (ms < n) {
      return;
    }
    if (ms < n * 1.5) {
      return Math.floor(ms / n) + ' ' + name;
    }
    return Math.ceil(ms / n) + ' ' + name + 's';
  }

  var debug = createCommonjsModule$1(function (module, exports) {
  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = ms;

  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */

  exports.formatters = {};

  /**
   * Previous log timestamp.
   */

  var prevTime;

  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */

  function selectColor(namespace) {
    var hash = 0, i;

    for (i in namespace) {
      hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return exports.colors[Math.abs(hash) % exports.colors.length];
  }

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */

  function createDebug(namespace) {

    function debug() {
      // disabled?
      if (!debug.enabled) return;

      var self = debug;

      // set `diff` timestamp
      var curr = +new Date();
      var ms$$1 = curr - (prevTime || curr);
      self.diff = ms$$1;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // turn the `arguments` into a proper Array
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = exports.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // apply env-specific formatting (colors, etc.)
      exports.formatArgs.call(self, args);

      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);

    // env-specific initialization logic for debug instances
    if ('function' === typeof exports.init) {
      exports.init(debug);
    }

    return debug;
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */

  function enable(namespaces) {
    exports.save(namespaces);

    exports.names = [];
    exports.skips = [];

    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (var i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }
  }

  /**
   * Disable debug output.
   *
   * @api public
   */

  function disable() {
    exports.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  function enabled(name) {
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }
  });
  var debug_1 = debug.coerce;
  var debug_2 = debug.disable;
  var debug_3 = debug.enable;
  var debug_4 = debug.enabled;
  var debug_5 = debug.humanize;
  var debug_6 = debug.names;
  var debug_7 = debug.skips;
  var debug_8 = debug.formatters;

  var browser$1 = createCommonjsModule$1(function (module, exports) {
  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = debug;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = 'undefined' != typeof chrome
                 && 'undefined' != typeof chrome.storage
                    ? chrome.storage.local
                    : localstorage();

  /**
   * Colors.
   */

  exports.colors = [
    'lightseagreen',
    'forestgreen',
    'goldenrod',
    'dodgerblue',
    'darkorchid',
    'crimson'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
      return true;
    }

    // is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
      // is firebug? http://stackoverflow.com/a/398120/376773
      (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
      // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
      // double check webkit in userAgent just in case we are in a worker
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  exports.formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return '[UnexpectedJSONParseError]: ' + err.message;
    }
  };


  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
    var useColors = this.useColors;

    args[0] = (useColors ? '%c' : '')
      + this.namespace
      + (useColors ? ' %c' : ' ')
      + args[0]
      + (useColors ? '%c ' : ' ')
      + '+' + exports.humanize(this.diff);

    if (!useColors) return;

    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function(match) {
      if ('%%' === match) return;
      index++;
      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */

  function log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */

  function save(namespaces) {
    try {
      if (null == namespaces) {
        exports.storage.removeItem('debug');
      } else {
        exports.storage.debug = namespaces;
      }
    } catch(e) {}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
    var r;
    try {
      r = exports.storage.debug;
    } catch(e) {}

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  }

  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */

  exports.enable(load());

  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {}
  }
  });
  var browser_1 = browser$1.log;
  var browser_2 = browser$1.formatArgs;
  var browser_3 = browser$1.save;
  var browser_4 = browser$1.load;
  var browser_5 = browser$1.useColors;
  var browser_6 = browser$1.storage;
  var browser_7 = browser$1.colors;

  var debug$1 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$1 = browser$1('sockjs-client:utils:url');
  }

  var url = {
    getOrigin: function(url) {
      if (!url) {
        return null;
      }

      var p = new urlParse(url);
      if (p.protocol === 'file:') {
        return null;
      }

      var port = p.port;
      if (!port) {
        port = (p.protocol === 'https:') ? '443' : '80';
      }

      return p.protocol + '//' + p.hostname + ':' + port;
    }

  , isOriginEqual: function(a, b) {
      var res = this.getOrigin(a) === this.getOrigin(b);
      debug$1('same', a, b, res);
      return res;
    }

  , isSchemeEqual: function(a, b) {
      return (a.split(':')[0] === b.split(':')[0]);
    }

  , addPath: function (url, path) {
      var qs = url.split('?');
      return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
    }

  , addQuery: function (url, q) {
      return url + (url.indexOf('?') === -1 ? ('?' + q) : ('&' + q));
    }
  };

  var inherits_browser = createCommonjsModule$1(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  });

  /* Simplified implementation of DOM2 EventTarget.
   *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
   */

  function EventTarget() {
    this._listeners = {};
  }

  EventTarget.prototype.addEventListener = function(eventType, listener) {
    if (!(eventType in this._listeners)) {
      this._listeners[eventType] = [];
    }
    var arr = this._listeners[eventType];
    // #4
    if (arr.indexOf(listener) === -1) {
      // Make a copy so as not to interfere with a current dispatchEvent.
      arr = arr.concat([listener]);
    }
    this._listeners[eventType] = arr;
  };

  EventTarget.prototype.removeEventListener = function(eventType, listener) {
    var arr = this._listeners[eventType];
    if (!arr) {
      return;
    }
    var idx = arr.indexOf(listener);
    if (idx !== -1) {
      if (arr.length > 1) {
        // Make a copy so as not to interfere with a current dispatchEvent.
        this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
      } else {
        delete this._listeners[eventType];
      }
      return;
    }
  };

  EventTarget.prototype.dispatchEvent = function() {
    var event = arguments[0];
    var t = event.type;
    // equivalent of Array.prototype.slice.call(arguments, 0);
    var args = arguments.length === 1 ? [event] : Array.apply(null, arguments);
    // TODO: This doesn't match the real behavior; per spec, onfoo get
    // their place in line from the /first/ time they're set from
    // non-null. Although WebKit bumps it to the end every time it's
    // set.
    if (this['on' + t]) {
      this['on' + t].apply(this, args);
    }
    if (t in this._listeners) {
      // Grab a reference to the listeners list. removeEventListener may alter the list.
      var listeners = this._listeners[t];
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].apply(this, args);
      }
    }
  };

  var eventtarget = EventTarget;

  function EventEmitter() {
    eventtarget.call(this);
  }

  inherits_browser(EventEmitter, eventtarget);

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (type) {
      delete this._listeners[type];
    } else {
      this._listeners = {};
    }
  };

  EventEmitter.prototype.once = function(type, listener) {
    var self = this
      , fired = false;

    function g() {
      self.removeListener(type, g);

      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }

    this.on(type, g);
  };

  EventEmitter.prototype.emit = function() {
    var type = arguments[0];
    var listeners = this._listeners[type];
    if (!listeners) {
      return;
    }
    // equivalent of Array.prototype.slice.call(arguments, 1);
    var l = arguments.length;
    var args = new Array(l - 1);
    for (var ai = 1; ai < l; ai++) {
      args[ai - 1] = arguments[ai];
    }
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener = eventtarget.prototype.addEventListener;
  EventEmitter.prototype.removeListener = eventtarget.prototype.removeEventListener;

  var EventEmitter_1 = EventEmitter;

  var emitter = {
  	EventEmitter: EventEmitter_1
  };

  var websocket$1 = createCommonjsModule$1(function (module) {

  var Driver = commonjsGlobal.WebSocket || commonjsGlobal.MozWebSocket;
  if (Driver) {
  	module.exports = function WebSocketBrowserDriver(url) {
  		return new Driver(url);
  	};
  } else {
  	module.exports = undefined;
  }
  });

  var EventEmitter$1 = emitter.EventEmitter
    ;

  var debug$2 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$2 = browser$1('sockjs-client:websocket');
  }

  function WebSocketTransport(transUrl, ignore, options) {
    if (!WebSocketTransport.enabled()) {
      throw new Error('Transport created when disabled');
    }

    EventEmitter$1.call(this);
    debug$2('constructor', transUrl);

    var self = this;
    var url$$1 = url.addPath(transUrl, '/websocket');
    if (url$$1.slice(0, 5) === 'https') {
      url$$1 = 'wss' + url$$1.slice(5);
    } else {
      url$$1 = 'ws' + url$$1.slice(4);
    }
    this.url = url$$1;

    this.ws = new websocket$1(this.url, [], options);
    this.ws.onmessage = function(e) {
      debug$2('message event', e.data);
      self.emit('message', e.data);
    };
    // Firefox has an interesting bug. If a websocket connection is
    // created after onunload, it stays alive even when user
    // navigates away from the page. In such situation let's lie -
    // let's not open the ws connection at all. See:
    // https://github.com/sockjs/sockjs-client/issues/28
    // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
    this.unloadRef = event.unloadAdd(function() {
      debug$2('unload');
      self.ws.close();
    });
    this.ws.onclose = function(e) {
      debug$2('close event', e.code, e.reason);
      self.emit('close', e.code, e.reason);
      self._cleanup();
    };
    this.ws.onerror = function(e) {
      debug$2('error event', e);
      self.emit('close', 1006, 'WebSocket connection broken');
      self._cleanup();
    };
  }

  inherits_browser(WebSocketTransport, EventEmitter$1);

  WebSocketTransport.prototype.send = function(data) {
    var msg = '[' + data + ']';
    debug$2('send', msg);
    this.ws.send(msg);
  };

  WebSocketTransport.prototype.close = function() {
    debug$2('close');
    var ws = this.ws;
    this._cleanup();
    if (ws) {
      ws.close();
    }
  };

  WebSocketTransport.prototype._cleanup = function() {
    debug$2('_cleanup');
    var ws = this.ws;
    if (ws) {
      ws.onmessage = ws.onclose = ws.onerror = null;
    }
    event.unloadDel(this.unloadRef);
    this.unloadRef = this.ws = null;
    this.removeAllListeners();
  };

  WebSocketTransport.enabled = function() {
    debug$2('enabled');
    return !!websocket$1;
  };
  WebSocketTransport.transportName = 'websocket';

  // In theory, ws should require 1 round trip. But in chrome, this is
  // not very stable over SSL. Most likely a ws connection requires a
  // separate SSL connection, in which case 2 round trips are an
  // absolute minumum.
  WebSocketTransport.roundTrips = 2;

  var websocket$2 = WebSocketTransport;

  var EventEmitter$2 = emitter.EventEmitter
    ;

  var debug$3 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$3 = browser$1('sockjs-client:buffered-sender');
  }

  function BufferedSender(url, sender) {
    debug$3(url);
    EventEmitter$2.call(this);
    this.sendBuffer = [];
    this.sender = sender;
    this.url = url;
  }

  inherits_browser(BufferedSender, EventEmitter$2);

  BufferedSender.prototype.send = function(message) {
    debug$3('send', message);
    this.sendBuffer.push(message);
    if (!this.sendStop) {
      this.sendSchedule();
    }
  };

  // For polling transports in a situation when in the message callback,
  // new message is being send. If the sending connection was started
  // before receiving one, it is possible to saturate the network and
  // timeout due to the lack of receiving socket. To avoid that we delay
  // sending messages by some small time, in order to let receiving
  // connection be started beforehand. This is only a halfmeasure and
  // does not fix the big problem, but it does make the tests go more
  // stable on slow networks.
  BufferedSender.prototype.sendScheduleWait = function() {
    debug$3('sendScheduleWait');
    var self = this;
    var tref;
    this.sendStop = function() {
      debug$3('sendStop');
      self.sendStop = null;
      clearTimeout(tref);
    };
    tref = setTimeout(function() {
      debug$3('timeout');
      self.sendStop = null;
      self.sendSchedule();
    }, 25);
  };

  BufferedSender.prototype.sendSchedule = function() {
    debug$3('sendSchedule', this.sendBuffer.length);
    var self = this;
    if (this.sendBuffer.length > 0) {
      var payload = '[' + this.sendBuffer.join(',') + ']';
      this.sendStop = this.sender(this.url, payload, function(err) {
        self.sendStop = null;
        if (err) {
          debug$3('error', err);
          self.emit('close', err.code || 1006, 'Sending error: ' + err);
          self.close();
        } else {
          self.sendScheduleWait();
        }
      });
      this.sendBuffer = [];
    }
  };

  BufferedSender.prototype._cleanup = function() {
    debug$3('_cleanup');
    this.removeAllListeners();
  };

  BufferedSender.prototype.close = function() {
    debug$3('close');
    this._cleanup();
    if (this.sendStop) {
      this.sendStop();
      this.sendStop = null;
    }
  };

  var bufferedSender = BufferedSender;

  var EventEmitter$3 = emitter.EventEmitter
    ;

  var debug$4 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$4 = browser$1('sockjs-client:polling');
  }

  function Polling(Receiver, receiveUrl, AjaxObject) {
    debug$4(receiveUrl);
    EventEmitter$3.call(this);
    this.Receiver = Receiver;
    this.receiveUrl = receiveUrl;
    this.AjaxObject = AjaxObject;
    this._scheduleReceiver();
  }

  inherits_browser(Polling, EventEmitter$3);

  Polling.prototype._scheduleReceiver = function() {
    debug$4('_scheduleReceiver');
    var self = this;
    var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);

    poll.on('message', function(msg) {
      debug$4('message', msg);
      self.emit('message', msg);
    });

    poll.once('close', function(code, reason) {
      debug$4('close', code, reason, self.pollIsClosing);
      self.poll = poll = null;

      if (!self.pollIsClosing) {
        if (reason === 'network') {
          self._scheduleReceiver();
        } else {
          self.emit('close', code || 1006, reason);
          self.removeAllListeners();
        }
      }
    });
  };

  Polling.prototype.abort = function() {
    debug$4('abort');
    this.removeAllListeners();
    this.pollIsClosing = true;
    if (this.poll) {
      this.poll.abort();
    }
  };

  var polling = Polling;

  var debug$5 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$5 = browser$1('sockjs-client:sender-receiver');
  }

  function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
    var pollUrl = url.addPath(transUrl, urlSuffix);
    debug$5(pollUrl);
    var self = this;
    bufferedSender.call(this, transUrl, senderFunc);

    this.poll = new polling(Receiver, pollUrl, AjaxObject);
    this.poll.on('message', function(msg) {
      debug$5('poll message', msg);
      self.emit('message', msg);
    });
    this.poll.once('close', function(code, reason) {
      debug$5('poll close', code, reason);
      self.poll = null;
      self.emit('close', code, reason);
      self.close();
    });
  }

  inherits_browser(SenderReceiver, bufferedSender);

  SenderReceiver.prototype.close = function() {
    bufferedSender.prototype.close.call(this);
    debug$5('close');
    this.removeAllListeners();
    if (this.poll) {
      this.poll.abort();
      this.poll = null;
    }
  };

  var senderReceiver = SenderReceiver;

  var debug$6 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$6 = browser$1('sockjs-client:ajax-based');
  }

  function createAjaxSender(AjaxObject) {
    return function(url$$1, payload, callback) {
      debug$6('create ajax sender', url$$1, payload);
      var opt = {};
      if (typeof payload === 'string') {
        opt.headers = {'Content-type': 'text/plain'};
      }
      var ajaxUrl = url.addPath(url$$1, '/xhr_send');
      var xo = new AjaxObject('POST', ajaxUrl, payload, opt);
      xo.once('finish', function(status) {
        debug$6('finish', status);
        xo = null;

        if (status !== 200 && status !== 204) {
          return callback(new Error('http status ' + status));
        }
        callback();
      });
      return function() {
        debug$6('abort');
        xo.close();
        xo = null;

        var err = new Error('Aborted');
        err.code = 1000;
        callback(err);
      };
    };
  }

  function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
    senderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
  }

  inherits_browser(AjaxBasedTransport, senderReceiver);

  var ajaxBased = AjaxBasedTransport;

  var EventEmitter$4 = emitter.EventEmitter
    ;

  var debug$7 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$7 = browser$1('sockjs-client:receiver:xhr');
  }

  function XhrReceiver(url, AjaxObject) {
    debug$7(url);
    EventEmitter$4.call(this);
    var self = this;

    this.bufferPosition = 0;

    this.xo = new AjaxObject('POST', url, null);
    this.xo.on('chunk', this._chunkHandler.bind(this));
    this.xo.once('finish', function(status, text) {
      debug$7('finish', status, text);
      self._chunkHandler(status, text);
      self.xo = null;
      var reason = status === 200 ? 'network' : 'permanent';
      debug$7('close', reason);
      self.emit('close', null, reason);
      self._cleanup();
    });
  }

  inherits_browser(XhrReceiver, EventEmitter$4);

  XhrReceiver.prototype._chunkHandler = function(status, text) {
    debug$7('_chunkHandler', status);
    if (status !== 200 || !text) {
      return;
    }

    for (var idx = -1; ; this.bufferPosition += idx + 1) {
      var buf = text.slice(this.bufferPosition);
      idx = buf.indexOf('\n');
      if (idx === -1) {
        break;
      }
      var msg = buf.slice(0, idx);
      if (msg) {
        debug$7('message', msg);
        this.emit('message', msg);
      }
    }
  };

  XhrReceiver.prototype._cleanup = function() {
    debug$7('_cleanup');
    this.removeAllListeners();
  };

  XhrReceiver.prototype.abort = function() {
    debug$7('abort');
    if (this.xo) {
      this.xo.close();
      debug$7('close');
      this.emit('close', null, 'user');
      this.xo = null;
    }
    this._cleanup();
  };

  var xhr$1 = XhrReceiver;

  var EventEmitter$5 = emitter.EventEmitter
    , XHR = commonjsGlobal.XMLHttpRequest
    ;

  var debug$8 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$8 = browser$1('sockjs-client:browser:xhr');
  }

  function AbstractXHRObject(method, url$$1, payload, opts) {
    debug$8(method, url$$1);
    var self = this;
    EventEmitter$5.call(this);

    setTimeout(function () {
      self._start(method, url$$1, payload, opts);
    }, 0);
  }

  inherits_browser(AbstractXHRObject, EventEmitter$5);

  AbstractXHRObject.prototype._start = function(method, url$$1, payload, opts) {
    var self = this;

    try {
      this.xhr = new XHR();
    } catch (x) {
      // intentionally empty
    }

    if (!this.xhr) {
      debug$8('no xhr');
      this.emit('finish', 0, 'no xhr support');
      this._cleanup();
      return;
    }

    // several browsers cache POSTs
    url$$1 = url.addQuery(url$$1, 't=' + (+new Date()));

    // Explorer tends to keep connection open, even after the
    // tab gets closed: http://bugs.jquery.com/ticket/5280
    this.unloadRef = event.unloadAdd(function() {
      debug$8('unload cleanup');
      self._cleanup(true);
    });
    try {
      this.xhr.open(method, url$$1, true);
      if (this.timeout && 'timeout' in this.xhr) {
        this.xhr.timeout = this.timeout;
        this.xhr.ontimeout = function() {
          debug$8('xhr timeout');
          self.emit('finish', 0, '');
          self._cleanup(false);
        };
      }
    } catch (e) {
      debug$8('exception', e);
      // IE raises an exception on wrong port.
      this.emit('finish', 0, '');
      this._cleanup(false);
      return;
    }

    if ((!opts || !opts.noCredentials) && AbstractXHRObject.supportsCORS) {
      debug$8('withCredentials');
      // Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
      // "This never affects same-site requests."

      this.xhr.withCredentials = true;
    }
    if (opts && opts.headers) {
      for (var key in opts.headers) {
        this.xhr.setRequestHeader(key, opts.headers[key]);
      }
    }

    this.xhr.onreadystatechange = function() {
      if (self.xhr) {
        var x = self.xhr;
        var text, status;
        debug$8('readyState', x.readyState);
        switch (x.readyState) {
        case 3:
          // IE doesn't like peeking into responseText or status
          // on Microsoft.XMLHTTP and readystate=3
          try {
            status = x.status;
            text = x.responseText;
          } catch (e) {
            // intentionally empty
          }
          debug$8('status', status);
          // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
          if (status === 1223) {
            status = 204;
          }

          // IE does return readystate == 3 for 404 answers.
          if (status === 200 && text && text.length > 0) {
            debug$8('chunk');
            self.emit('chunk', status, text);
          }
          break;
        case 4:
          status = x.status;
          debug$8('status', status);
          // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
          if (status === 1223) {
            status = 204;
          }
          // IE returns this for a bad port
          // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383770(v=vs.85).aspx
          if (status === 12005 || status === 12029) {
            status = 0;
          }

          debug$8('finish', status, x.responseText);
          self.emit('finish', status, x.responseText);
          self._cleanup(false);
          break;
        }
      }
    };

    try {
      self.xhr.send(payload);
    } catch (e) {
      self.emit('finish', 0, '');
      self._cleanup(false);
    }
  };

  AbstractXHRObject.prototype._cleanup = function(abort) {
    debug$8('cleanup');
    if (!this.xhr) {
      return;
    }
    this.removeAllListeners();
    event.unloadDel(this.unloadRef);

    // IE needs this field to be a function
    this.xhr.onreadystatechange = function() {};
    if (this.xhr.ontimeout) {
      this.xhr.ontimeout = null;
    }

    if (abort) {
      try {
        this.xhr.abort();
      } catch (x) {
        // intentionally empty
      }
    }
    this.unloadRef = this.xhr = null;
  };

  AbstractXHRObject.prototype.close = function() {
    debug$8('close');
    this._cleanup(true);
  };

  AbstractXHRObject.enabled = !!XHR;
  // override XMLHttpRequest for IE6/7
  // obfuscate to avoid firewalls
  var axo = ['Active'].concat('Object').join('X');
  if (!AbstractXHRObject.enabled && (axo in commonjsGlobal)) {
    debug$8('overriding xmlhttprequest');
    XHR = function() {
      try {
        return new commonjsGlobal[axo]('Microsoft.XMLHTTP');
      } catch (e) {
        return null;
      }
    };
    AbstractXHRObject.enabled = !!new XHR();
  }

  var cors = false;
  try {
    cors = 'withCredentials' in new XHR();
  } catch (ignored) {
    // intentionally empty
  }

  AbstractXHRObject.supportsCORS = cors;

  var abstractXhr = AbstractXHRObject;

  function XHRCorsObject(method, url, payload, opts) {
    abstractXhr.call(this, method, url, payload, opts);
  }

  inherits_browser(XHRCorsObject, abstractXhr);

  XHRCorsObject.enabled = abstractXhr.enabled && abstractXhr.supportsCORS;

  var xhrCors = XHRCorsObject;

  function XHRLocalObject(method, url, payload /*, opts */) {
    abstractXhr.call(this, method, url, payload, {
      noCredentials: true
    });
  }

  inherits_browser(XHRLocalObject, abstractXhr);

  XHRLocalObject.enabled = abstractXhr.enabled;

  var xhrLocal = XHRLocalObject;

  var browser$2 = {
    isOpera: function() {
      return commonjsGlobal.navigator &&
        /opera/i.test(commonjsGlobal.navigator.userAgent);
    }

  , isKonqueror: function() {
      return commonjsGlobal.navigator &&
        /konqueror/i.test(commonjsGlobal.navigator.userAgent);
    }

    // #187 wrap document.domain in try/catch because of WP8 from file:///
  , hasDomain: function () {
      // non-browser client always has a domain
      if (!commonjsGlobal.document) {
        return true;
      }

      try {
        return !!commonjsGlobal.document.domain;
      } catch (e) {
        return false;
      }
    }
  };

  function XhrStreamingTransport(transUrl) {
    if (!xhrLocal.enabled && !xhrCors.enabled) {
      throw new Error('Transport created when disabled');
    }
    ajaxBased.call(this, transUrl, '/xhr_streaming', xhr$1, xhrCors);
  }

  inherits_browser(XhrStreamingTransport, ajaxBased);

  XhrStreamingTransport.enabled = function(info) {
    if (info.nullOrigin) {
      return false;
    }
    // Opera doesn't support xhr-streaming #60
    // But it might be able to #92
    if (browser$2.isOpera()) {
      return false;
    }

    return xhrCors.enabled;
  };

  XhrStreamingTransport.transportName = 'xhr-streaming';
  XhrStreamingTransport.roundTrips = 2; // preflight, ajax

  // Safari gets confused when a streaming ajax request is started
  // before onload. This causes the load indicator to spin indefinetely.
  // Only require body when used in a browser
  XhrStreamingTransport.needBody = !!commonjsGlobal.document;

  var xhrStreaming = XhrStreamingTransport;

  var EventEmitter$6 = emitter.EventEmitter
    ;

  var debug$9 = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$9 = browser$1('sockjs-client:sender:xdr');
  }

  // References:
  //   http://ajaxian.com/archives/100-line-ajax-wrapper
  //   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

  function XDRObject(method, url$$1, payload) {
    debug$9(method, url$$1);
    var self = this;
    EventEmitter$6.call(this);

    setTimeout(function() {
      self._start(method, url$$1, payload);
    }, 0);
  }

  inherits_browser(XDRObject, EventEmitter$6);

  XDRObject.prototype._start = function(method, url$$1, payload) {
    debug$9('_start');
    var self = this;
    var xdr = new commonjsGlobal.XDomainRequest();
    // IE caches even POSTs
    url$$1 = url.addQuery(url$$1, 't=' + (+new Date()));

    xdr.onerror = function() {
      debug$9('onerror');
      self._error();
    };
    xdr.ontimeout = function() {
      debug$9('ontimeout');
      self._error();
    };
    xdr.onprogress = function() {
      debug$9('progress', xdr.responseText);
      self.emit('chunk', 200, xdr.responseText);
    };
    xdr.onload = function() {
      debug$9('load');
      self.emit('finish', 200, xdr.responseText);
      self._cleanup(false);
    };
    this.xdr = xdr;
    this.unloadRef = event.unloadAdd(function() {
      self._cleanup(true);
    });
    try {
      // Fails with AccessDenied if port number is bogus
      this.xdr.open(method, url$$1);
      if (this.timeout) {
        this.xdr.timeout = this.timeout;
      }
      this.xdr.send(payload);
    } catch (x) {
      this._error();
    }
  };

  XDRObject.prototype._error = function() {
    this.emit('finish', 0, '');
    this._cleanup(false);
  };

  XDRObject.prototype._cleanup = function(abort) {
    debug$9('cleanup', abort);
    if (!this.xdr) {
      return;
    }
    this.removeAllListeners();
    event.unloadDel(this.unloadRef);

    this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
    if (abort) {
      try {
        this.xdr.abort();
      } catch (x) {
        // intentionally empty
      }
    }
    this.unloadRef = this.xdr = null;
  };

  XDRObject.prototype.close = function() {
    debug$9('close');
    this._cleanup(true);
  };

  // IE 8/9 if the request target uses the same scheme - #79
  XDRObject.enabled = !!(commonjsGlobal.XDomainRequest && browser$2.hasDomain());

  var xdr = XDRObject;

  // According to:
  //   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
  //   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/

  function XdrStreamingTransport(transUrl) {
    if (!xdr.enabled) {
      throw new Error('Transport created when disabled');
    }
    ajaxBased.call(this, transUrl, '/xhr_streaming', xhr$1, xdr);
  }

  inherits_browser(XdrStreamingTransport, ajaxBased);

  XdrStreamingTransport.enabled = function(info) {
    if (info.cookie_needed || info.nullOrigin) {
      return false;
    }
    return xdr.enabled && info.sameScheme;
  };

  XdrStreamingTransport.transportName = 'xdr-streaming';
  XdrStreamingTransport.roundTrips = 2; // preflight, ajax

  var xdrStreaming = XdrStreamingTransport;

  var eventsource = commonjsGlobal.EventSource;

  var EventEmitter$7 = emitter.EventEmitter
    ;

  var debug$a = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$a = browser$1('sockjs-client:receiver:eventsource');
  }

  function EventSourceReceiver(url) {
    debug$a(url);
    EventEmitter$7.call(this);

    var self = this;
    var es = this.es = new eventsource(url);
    es.onmessage = function(e) {
      debug$a('message', e.data);
      self.emit('message', decodeURI(e.data));
    };
    es.onerror = function(e) {
      debug$a('error', es.readyState, e);
      // ES on reconnection has readyState = 0 or 1.
      // on network error it's CLOSED = 2
      var reason = (es.readyState !== 2 ? 'network' : 'permanent');
      self._cleanup();
      self._close(reason);
    };
  }

  inherits_browser(EventSourceReceiver, EventEmitter$7);

  EventSourceReceiver.prototype.abort = function() {
    debug$a('abort');
    this._cleanup();
    this._close('user');
  };

  EventSourceReceiver.prototype._cleanup = function() {
    debug$a('cleanup');
    var es = this.es;
    if (es) {
      es.onmessage = es.onerror = null;
      es.close();
      this.es = null;
    }
  };

  EventSourceReceiver.prototype._close = function(reason) {
    debug$a('close', reason);
    var self = this;
    // Safari and chrome < 15 crash if we close window before
    // waiting for ES cleanup. See:
    // https://code.google.com/p/chromium/issues/detail?id=89155
    setTimeout(function() {
      self.emit('close', null, reason);
      self.removeAllListeners();
    }, 200);
  };

  var eventsource$1 = EventSourceReceiver;

  function EventSourceTransport(transUrl) {
    if (!EventSourceTransport.enabled()) {
      throw new Error('Transport created when disabled');
    }

    ajaxBased.call(this, transUrl, '/eventsource', eventsource$1, xhrCors);
  }

  inherits_browser(EventSourceTransport, ajaxBased);

  EventSourceTransport.enabled = function() {
    return !!eventsource;
  };

  EventSourceTransport.transportName = 'eventsource';
  EventSourceTransport.roundTrips = 2;

  var eventsource$2 = EventSourceTransport;

  var json3 = createCommonjsModule$1(function (module, exports) {
  (function () {
    // Detect the `define` function exposed by asynchronous module loaders. The
    // strict `define` check is necessary for compatibility with `r.js`.
    var isLoader = typeof undefined === "function" && undefined.amd;

    // A set of types used to distinguish objects from primitives.
    var objectTypes = {
      "function": true,
      "object": true
    };

    // Detect the `exports` object exposed by CommonJS implementations.
    var freeExports = exports && !exports.nodeType && exports;

    // Use the `global` object exposed by Node (including Browserify via
    // `insert-module-globals`), Narwhal, and Ringo as the default context,
    // and the `window` object in browsers. Rhino exports a `global` function
    // instead.
    var root = objectTypes[typeof window] && window || this,
        freeGlobal = freeExports && objectTypes['object'] && module && !module.nodeType && typeof commonjsGlobal == "object" && commonjsGlobal;

    if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
      root = freeGlobal;
    }

    // Public: Initializes JSON 3 using the given `context` object, attaching the
    // `stringify` and `parse` functions to the specified `exports` object.
    function runInContext(context, exports) {
      context || (context = root["Object"]());
      exports || (exports = root["Object"]());

      // Native constructor aliases.
      var Number = context["Number"] || root["Number"],
          String = context["String"] || root["String"],
          Object = context["Object"] || root["Object"],
          Date = context["Date"] || root["Date"],
          SyntaxError = context["SyntaxError"] || root["SyntaxError"],
          TypeError = context["TypeError"] || root["TypeError"],
          Math = context["Math"] || root["Math"],
          nativeJSON = context["JSON"] || root["JSON"];

      // Delegate to the native `stringify` and `parse` implementations.
      if (typeof nativeJSON == "object" && nativeJSON) {
        exports.stringify = nativeJSON.stringify;
        exports.parse = nativeJSON.parse;
      }

      // Convenience aliases.
      var objectProto = Object.prototype,
          getClass = objectProto.toString,
          isProperty, forEach, undef;

      // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
      var isExtended = new Date(-3509827334573292);
      try {
        // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
        // results for certain dates in Opera >= 10.53.
        isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
          // Safari < 2.0.2 stores the internal millisecond time value correctly,
          // but clips the values returned by the date methods to the range of
          // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
          isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
      } catch (exception) {}

      // Internal: Determines whether the native `JSON.stringify` and `parse`
      // implementations are spec-compliant. Based on work by Ken Snyder.
      function has(name) {
        if (has[name] !== undef) {
          // Return cached feature test result.
          return has[name];
        }
        var isSupported;
        if (name == "bug-string-char-index") {
          // IE <= 7 doesn't support accessing string characters using square
          // bracket notation. IE 8 only supports this for primitives.
          isSupported = "a"[0] != "a";
        } else if (name == "json") {
          // Indicates whether both `JSON.stringify` and `JSON.parse` are
          // supported.
          isSupported = has("json-stringify") && has("json-parse");
        } else {
          var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
          // Test `JSON.stringify`.
          if (name == "json-stringify") {
            var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
            if (stringifySupported) {
              // A test function object with a custom `toJSON` method.
              (value = function () {
                return 1;
              }).toJSON = value;
              try {
                stringifySupported =
                  // Firefox 3.1b1 and b2 serialize string, number, and boolean
                  // primitives as object literals.
                  stringify(0) === "0" &&
                  // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                  // literals.
                  stringify(new Number()) === "0" &&
                  stringify(new String()) == '""' &&
                  // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                  // does not define a canonical JSON representation (this applies to
                  // objects with `toJSON` properties as well, *unless* they are nested
                  // within an object or array).
                  stringify(getClass) === undef &&
                  // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                  // FF 3.1b3 pass this test.
                  stringify(undef) === undef &&
                  // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                  // respectively, if the value is omitted entirely.
                  stringify() === undef &&
                  // FF 3.1b1, 2 throw an error if the given value is not a number,
                  // string, array, object, Boolean, or `null` literal. This applies to
                  // objects with custom `toJSON` methods as well, unless they are nested
                  // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                  // methods entirely.
                  stringify(value) === "1" &&
                  stringify([value]) == "[1]" &&
                  // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                  // `"[null]"`.
                  stringify([undef]) == "[null]" &&
                  // YUI 3.0.0b1 fails to serialize `null` literals.
                  stringify(null) == "null" &&
                  // FF 3.1b1, 2 halts serialization if an array contains a function:
                  // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                  // elides non-JSON values from objects and arrays, unless they
                  // define custom `toJSON` methods.
                  stringify([undef, getClass, null]) == "[null,null,null]" &&
                  // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                  // where character escape codes are expected (e.g., `\b` => `\u0008`).
                  stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                  // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                  stringify(null, value) === "1" &&
                  stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                  // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                  // serialize extended years.
                  stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                  // The milliseconds are optional in ES 5, but required in 5.1.
                  stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                  // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                  // four-digit years instead of six-digit years. Credits: @Yaffle.
                  stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                  // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                  // values less than 1000. Credits: @Yaffle.
                  stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
              } catch (exception) {
                stringifySupported = false;
              }
            }
            isSupported = stringifySupported;
          }
          // Test `JSON.parse`.
          if (name == "json-parse") {
            var parse = exports.parse;
            if (typeof parse == "function") {
              try {
                // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
                // Conforming implementations should also coerce the initial argument to
                // a string prior to parsing.
                if (parse("0") === 0 && !parse(false)) {
                  // Simple parsing test.
                  value = parse(serialized);
                  var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                  if (parseSupported) {
                    try {
                      // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                      parseSupported = !parse('"\t"');
                    } catch (exception) {}
                    if (parseSupported) {
                      try {
                        // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                        // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                        // certain octal literals.
                        parseSupported = parse("01") !== 1;
                      } catch (exception) {}
                    }
                    if (parseSupported) {
                      try {
                        // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                        // points. These environments, along with FF 3.1b1 and 2,
                        // also allow trailing commas in JSON objects and arrays.
                        parseSupported = parse("1.") !== 1;
                      } catch (exception) {}
                    }
                  }
                }
              } catch (exception) {
                parseSupported = false;
              }
            }
            isSupported = parseSupported;
          }
        }
        return has[name] = !!isSupported;
      }

      if (!has("json")) {
        // Common `[[Class]]` name aliases.
        var functionClass = "[object Function]",
            dateClass = "[object Date]",
            numberClass = "[object Number]",
            stringClass = "[object String]",
            arrayClass = "[object Array]",
            booleanClass = "[object Boolean]";

        // Detect incomplete support for accessing string characters by index.
        var charIndexBuggy = has("bug-string-char-index");

        // Define additional utility methods if the `Date` methods are buggy.
        if (!isExtended) {
          var floor = Math.floor;
          // A mapping between the months of the year and the number of days between
          // January 1st and the first of the respective month.
          var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
          // Internal: Calculates the number of days between the Unix epoch and the
          // first day of the given month.
          var getDay = function (year, month) {
            return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
          };
        }

        // Internal: Determines if a property is a direct property of the given
        // object. Delegates to the native `Object#hasOwnProperty` method.
        if (!(isProperty = objectProto.hasOwnProperty)) {
          isProperty = function (property) {
            var members = {}, constructor;
            if ((members.__proto__ = null, members.__proto__ = {
              // The *proto* property cannot be set multiple times in recent
              // versions of Firefox and SeaMonkey.
              "toString": 1
            }, members).toString != getClass) {
              // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
              // supports the mutable *proto* property.
              isProperty = function (property) {
                // Capture and break the object's prototype chain (see section 8.6.2
                // of the ES 5.1 spec). The parenthesized expression prevents an
                // unsafe transformation by the Closure Compiler.
                var original = this.__proto__, result = property in (this.__proto__ = null, this);
                // Restore the original prototype chain.
                this.__proto__ = original;
                return result;
              };
            } else {
              // Capture a reference to the top-level `Object` constructor.
              constructor = members.constructor;
              // Use the `constructor` property to simulate `Object#hasOwnProperty` in
              // other environments.
              isProperty = function (property) {
                var parent = (this.constructor || constructor).prototype;
                return property in this && !(property in parent && this[property] === parent[property]);
              };
            }
            members = null;
            return isProperty.call(this, property);
          };
        }

        // Internal: Normalizes the `for...in` iteration algorithm across
        // environments. Each enumerated key is yielded to a `callback` function.
        forEach = function (object, callback) {
          var size = 0, Properties, members, property;

          // Tests for bugs in the current environment's `for...in` algorithm. The
          // `valueOf` property inherits the non-enumerable flag from
          // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
          (Properties = function () {
            this.valueOf = 0;
          }).prototype.valueOf = 0;

          // Iterate over a new instance of the `Properties` class.
          members = new Properties();
          for (property in members) {
            // Ignore all properties inherited from `Object.prototype`.
            if (isProperty.call(members, property)) {
              size++;
            }
          }
          Properties = members = null;

          // Normalize the iteration algorithm.
          if (!size) {
            // A list of non-enumerable properties inherited from `Object.prototype`.
            members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
            // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
            // properties.
            forEach = function (object, callback) {
              var isFunction = getClass.call(object) == functionClass, property, length;
              var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
              for (property in object) {
                // Gecko <= 1.0 enumerates the `prototype` property of functions under
                // certain conditions; IE does not.
                if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                  callback(property);
                }
              }
              // Manually invoke the callback for each non-enumerable property.
              for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
            };
          } else if (size == 2) {
            // Safari <= 2.0.4 enumerates shadowed properties twice.
            forEach = function (object, callback) {
              // Create a set of iterated properties.
              var members = {}, isFunction = getClass.call(object) == functionClass, property;
              for (property in object) {
                // Store each property name to prevent double enumeration. The
                // `prototype` property of functions is not enumerated due to cross-
                // environment inconsistencies.
                if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                  callback(property);
                }
              }
            };
          } else {
            // No bugs detected; use the standard `for...in` algorithm.
            forEach = function (object, callback) {
              var isFunction = getClass.call(object) == functionClass, property, isConstructor;
              for (property in object) {
                if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                  callback(property);
                }
              }
              // Manually invoke the callback for the `constructor` property due to
              // cross-environment inconsistencies.
              if (isConstructor || isProperty.call(object, (property = "constructor"))) {
                callback(property);
              }
            };
          }
          return forEach(object, callback);
        };

        // Public: Serializes a JavaScript `value` as a JSON string. The optional
        // `filter` argument may specify either a function that alters how object and
        // array members are serialized, or an array of strings and numbers that
        // indicates which properties should be serialized. The optional `width`
        // argument may be either a string or number that specifies the indentation
        // level of the output.
        if (!has("json-stringify")) {
          // Internal: A map of control characters and their escaped equivalents.
          var Escapes = {
            92: "\\\\",
            34: '\\"',
            8: "\\b",
            12: "\\f",
            10: "\\n",
            13: "\\r",
            9: "\\t"
          };

          // Internal: Converts `value` into a zero-padded string such that its
          // length is at least equal to `width`. The `width` must be <= 6.
          var leadingZeroes = "000000";
          var toPaddedString = function (width, value) {
            // The `|| 0` expression is necessary to work around a bug in
            // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
            return (leadingZeroes + (value || 0)).slice(-width);
          };

          // Internal: Double-quotes a string `value`, replacing all ASCII control
          // characters (characters with code unit values between 0 and 31) with
          // their escaped equivalents. This is an implementation of the
          // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
          var unicodePrefix = "\\u00";
          var quote = function (value) {
            var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
            var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
            for (; index < length; index++) {
              var charCode = value.charCodeAt(index);
              // If the character is a control character, append its Unicode or
              // shorthand escape sequence; otherwise, append the character as-is.
              switch (charCode) {
                case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                  result += Escapes[charCode];
                  break;
                default:
                  if (charCode < 32) {
                    result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                    break;
                  }
                  result += useCharIndex ? symbols[index] : value.charAt(index);
              }
            }
            return result + '"';
          };

          // Internal: Recursively serializes an object. Implements the
          // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
          var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
            var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
            try {
              // Necessary for host object support.
              value = object[property];
            } catch (exception) {}
            if (typeof value == "object" && value) {
              className = getClass.call(value);
              if (className == dateClass && !isProperty.call(value, "toJSON")) {
                if (value > -1 / 0 && value < 1 / 0) {
                  // Dates are serialized according to the `Date#toJSON` method
                  // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                  // for the ISO 8601 date time string format.
                  if (getDay) {
                    // Manually compute the year, month, date, hours, minutes,
                    // seconds, and milliseconds if the `getUTC*` methods are
                    // buggy. Adapted from @Yaffle's `date-shim` project.
                    date = floor(value / 864e5);
                    for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                    for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                    date = 1 + date - getDay(year, month);
                    // The `time` value specifies the time within the day (see ES
                    // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                    // to compute `A modulo B`, as the `%` operator does not
                    // correspond to the `modulo` operation for negative numbers.
                    time = (value % 864e5 + 864e5) % 864e5;
                    // The hours, minutes, seconds, and milliseconds are obtained by
                    // decomposing the time within the day. See section 15.9.1.10.
                    hours = floor(time / 36e5) % 24;
                    minutes = floor(time / 6e4) % 60;
                    seconds = floor(time / 1e3) % 60;
                    milliseconds = time % 1e3;
                  } else {
                    year = value.getUTCFullYear();
                    month = value.getUTCMonth();
                    date = value.getUTCDate();
                    hours = value.getUTCHours();
                    minutes = value.getUTCMinutes();
                    seconds = value.getUTCSeconds();
                    milliseconds = value.getUTCMilliseconds();
                  }
                  // Serialize extended years correctly.
                  value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                    "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                    // Months, dates, hours, minutes, and seconds should have two
                    // digits; milliseconds should have three.
                    "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                    // Milliseconds are optional in ES 5.0, but required in 5.1.
                    "." + toPaddedString(3, milliseconds) + "Z";
                } else {
                  value = null;
                }
              } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
                // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
                // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
                // ignores all `toJSON` methods on these objects unless they are
                // defined directly on an instance.
                value = value.toJSON(property);
              }
            }
            if (callback) {
              // If a replacement function was provided, call it to obtain the value
              // for serialization.
              value = callback.call(object, property, value);
            }
            if (value === null) {
              return "null";
            }
            className = getClass.call(value);
            if (className == booleanClass) {
              // Booleans are represented literally.
              return "" + value;
            } else if (className == numberClass) {
              // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
              // `"null"`.
              return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
            } else if (className == stringClass) {
              // Strings are double-quoted and escaped.
              return quote("" + value);
            }
            // Recursively serialize objects and arrays.
            if (typeof value == "object") {
              // Check for cyclic structures. This is a linear search; performance
              // is inversely proportional to the number of unique nested objects.
              for (length = stack.length; length--;) {
                if (stack[length] === value) {
                  // Cyclic structures cannot be serialized by `JSON.stringify`.
                  throw TypeError();
                }
              }
              // Add the object to the stack of traversed objects.
              stack.push(value);
              results = [];
              // Save the current indentation level and indent one additional level.
              prefix = indentation;
              indentation += whitespace;
              if (className == arrayClass) {
                // Recursively serialize array elements.
                for (index = 0, length = value.length; index < length; index++) {
                  element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                  results.push(element === undef ? "null" : element);
                }
                result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
              } else {
                // Recursively serialize object members. Members are selected from
                // either a user-specified list of property names, or the object
                // itself.
                forEach(properties || value, function (property) {
                  var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                  if (element !== undef) {
                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                    // is not the empty string, let `member` {quote(property) + ":"}
                    // be the concatenation of `member` and the `space` character."
                    // The "`space` character" refers to the literal space
                    // character, not the `space` {width} argument provided to
                    // `JSON.stringify`.
                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                  }
                });
                result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
              }
              // Remove the object from the traversed object stack.
              stack.pop();
              return result;
            }
          };

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          exports.stringify = function (source, filter, width) {
            var whitespace, callback, properties, className;
            if (objectTypes[typeof filter] && filter) {
              if ((className = getClass.call(filter)) == functionClass) {
                callback = filter;
              } else if (className == arrayClass) {
                // Convert the property names array into a makeshift set.
                properties = {};
                for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
              }
            }
            if (width) {
              if ((className = getClass.call(width)) == numberClass) {
                // Convert the `width` to an integer and create a string containing
                // `width` number of space characters.
                if ((width -= width % 1) > 0) {
                  for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
                }
              } else if (className == stringClass) {
                whitespace = width.length <= 10 ? width : width.slice(0, 10);
              }
            }
            // Opera <= 7.54u2 discards the values associated with empty string keys
            // (`""`) only if they are used directly within an object member list
            // (e.g., `!("" in { "": 1})`).
            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
          };
        }

        // Public: Parses a JSON source string.
        if (!has("json-parse")) {
          var fromCharCode = String.fromCharCode;

          // Internal: A map of escaped control characters and their unescaped
          // equivalents.
          var Unescapes = {
            92: "\\",
            34: '"',
            47: "/",
            98: "\b",
            116: "\t",
            110: "\n",
            102: "\f",
            114: "\r"
          };

          // Internal: Stores the parser state.
          var Index, Source;

          // Internal: Resets the parser state and throws a `SyntaxError`.
          var abort = function () {
            Index = Source = null;
            throw SyntaxError();
          };

          // Internal: Returns the next token, or `"$"` if the parser has reached
          // the end of the source string. A token may be a string, number, `null`
          // literal, or Boolean literal.
          var lex = function () {
            var source = Source, length = source.length, value, begin, position, isSigned, charCode;
            while (Index < length) {
              charCode = source.charCodeAt(Index);
              switch (charCode) {
                case 9: case 10: case 13: case 32:
                  // Skip whitespace tokens, including tabs, carriage returns, line
                  // feeds, and space characters.
                  Index++;
                  break;
                case 123: case 125: case 91: case 93: case 58: case 44:
                  // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                  // the current position.
                  value = charIndexBuggy ? source.charAt(Index) : source[Index];
                  Index++;
                  return value;
                case 34:
                  // `"` delimits a JSON string; advance to the next character and
                  // begin parsing the string. String tokens are prefixed with the
                  // sentinel `@` character to distinguish them from punctuators and
                  // end-of-string tokens.
                  for (value = "@", Index++; Index < length;) {
                    charCode = source.charCodeAt(Index);
                    if (charCode < 32) {
                      // Unescaped ASCII control characters (those with a code unit
                      // less than the space character) are not permitted.
                      abort();
                    } else if (charCode == 92) {
                      // A reverse solidus (`\`) marks the beginning of an escaped
                      // control character (including `"`, `\`, and `/`) or Unicode
                      // escape sequence.
                      charCode = source.charCodeAt(++Index);
                      switch (charCode) {
                        case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                          // Revive escaped control characters.
                          value += Unescapes[charCode];
                          Index++;
                          break;
                        case 117:
                          // `\u` marks the beginning of a Unicode escape sequence.
                          // Advance to the first character and validate the
                          // four-digit code point.
                          begin = ++Index;
                          for (position = Index + 4; Index < position; Index++) {
                            charCode = source.charCodeAt(Index);
                            // A valid sequence comprises four hexdigits (case-
                            // insensitive) that form a single hexadecimal value.
                            if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                              // Invalid Unicode escape sequence.
                              abort();
                            }
                          }
                          // Revive the escaped character.
                          value += fromCharCode("0x" + source.slice(begin, Index));
                          break;
                        default:
                          // Invalid escape sequence.
                          abort();
                      }
                    } else {
                      if (charCode == 34) {
                        // An unescaped double-quote character marks the end of the
                        // string.
                        break;
                      }
                      charCode = source.charCodeAt(Index);
                      begin = Index;
                      // Optimize for the common case where a string is valid.
                      while (charCode >= 32 && charCode != 92 && charCode != 34) {
                        charCode = source.charCodeAt(++Index);
                      }
                      // Append the string as-is.
                      value += source.slice(begin, Index);
                    }
                  }
                  if (source.charCodeAt(Index) == 34) {
                    // Advance to the next character and return the revived string.
                    Index++;
                    return value;
                  }
                  // Unterminated string.
                  abort();
                default:
                  // Parse numbers and literals.
                  begin = Index;
                  // Advance past the negative sign, if one is specified.
                  if (charCode == 45) {
                    isSigned = true;
                    charCode = source.charCodeAt(++Index);
                  }
                  // Parse an integer or floating-point value.
                  if (charCode >= 48 && charCode <= 57) {
                    // Leading zeroes are interpreted as octal literals.
                    if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                      // Illegal octal literal.
                      abort();
                    }
                    isSigned = false;
                    // Parse the integer component.
                    for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                    // Floats cannot contain a leading decimal point; however, this
                    // case is already accounted for by the parser.
                    if (source.charCodeAt(Index) == 46) {
                      position = ++Index;
                      // Parse the decimal component.
                      for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                      if (position == Index) {
                        // Illegal trailing decimal.
                        abort();
                      }
                      Index = position;
                    }
                    // Parse exponents. The `e` denoting the exponent is
                    // case-insensitive.
                    charCode = source.charCodeAt(Index);
                    if (charCode == 101 || charCode == 69) {
                      charCode = source.charCodeAt(++Index);
                      // Skip past the sign following the exponent, if one is
                      // specified.
                      if (charCode == 43 || charCode == 45) {
                        Index++;
                      }
                      // Parse the exponential component.
                      for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                      if (position == Index) {
                        // Illegal empty exponent.
                        abort();
                      }
                      Index = position;
                    }
                    // Coerce the parsed value to a JavaScript number.
                    return +source.slice(begin, Index);
                  }
                  // A negative sign may only precede numbers.
                  if (isSigned) {
                    abort();
                  }
                  // `true`, `false`, and `null` literals.
                  if (source.slice(Index, Index + 4) == "true") {
                    Index += 4;
                    return true;
                  } else if (source.slice(Index, Index + 5) == "false") {
                    Index += 5;
                    return false;
                  } else if (source.slice(Index, Index + 4) == "null") {
                    Index += 4;
                    return null;
                  }
                  // Unrecognized token.
                  abort();
              }
            }
            // Return the sentinel `$` character if the parser has reached the end
            // of the source string.
            return "$";
          };

          // Internal: Parses a JSON `value` token.
          var get = function (value) {
            var results, hasMembers;
            if (value == "$") {
              // Unexpected end of input.
              abort();
            }
            if (typeof value == "string") {
              if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                // Remove the sentinel `@` character.
                return value.slice(1);
              }
              // Parse object and array literals.
              if (value == "[") {
                // Parses a JSON array, returning a new JavaScript array.
                results = [];
                for (;; hasMembers || (hasMembers = true)) {
                  value = lex();
                  // A closing square bracket marks the end of the array literal.
                  if (value == "]") {
                    break;
                  }
                  // If the array literal contains elements, the current token
                  // should be a comma separating the previous element from the
                  // next.
                  if (hasMembers) {
                    if (value == ",") {
                      value = lex();
                      if (value == "]") {
                        // Unexpected trailing `,` in array literal.
                        abort();
                      }
                    } else {
                      // A `,` must separate each array element.
                      abort();
                    }
                  }
                  // Elisions and leading commas are not permitted.
                  if (value == ",") {
                    abort();
                  }
                  results.push(get(value));
                }
                return results;
              } else if (value == "{") {
                // Parses a JSON object, returning a new JavaScript object.
                results = {};
                for (;; hasMembers || (hasMembers = true)) {
                  value = lex();
                  // A closing curly brace marks the end of the object literal.
                  if (value == "}") {
                    break;
                  }
                  // If the object literal contains members, the current token
                  // should be a comma separator.
                  if (hasMembers) {
                    if (value == ",") {
                      value = lex();
                      if (value == "}") {
                        // Unexpected trailing `,` in object literal.
                        abort();
                      }
                    } else {
                      // A `,` must separate each object member.
                      abort();
                    }
                  }
                  // Leading commas are not permitted, object property names must be
                  // double-quoted strings, and a `:` must separate each property
                  // name and value.
                  if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                    abort();
                  }
                  results[value.slice(1)] = get(lex());
                }
                return results;
              }
              // Unexpected token encountered.
              abort();
            }
            return value;
          };

          // Internal: Updates a traversed object member.
          var update = function (source, property, callback) {
            var element = walk(source, property, callback);
            if (element === undef) {
              delete source[property];
            } else {
              source[property] = element;
            }
          };

          // Internal: Recursively traverses a parsed JSON object, invoking the
          // `callback` function for each value. This is an implementation of the
          // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
          var walk = function (source, property, callback) {
            var value = source[property], length;
            if (typeof value == "object" && value) {
              // `forEach` can't be used to traverse an array in Opera <= 8.54
              // because its `Object#hasOwnProperty` implementation returns `false`
              // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
              if (getClass.call(value) == arrayClass) {
                for (length = value.length; length--;) {
                  update(value, length, callback);
                }
              } else {
                forEach(value, function (property) {
                  update(value, property, callback);
                });
              }
            }
            return callback.call(source, property, value);
          };

          // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
          exports.parse = function (source, callback) {
            var result, value;
            Index = 0;
            Source = "" + source;
            result = get(lex());
            // If a JSON string contains multiple tokens, it is invalid.
            if (lex() != "$") {
              abort();
            }
            // Reset the parser state.
            Index = Source = null;
            return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
          };
        }
      }

      exports["runInContext"] = runInContext;
      return exports;
    }

    if (freeExports && !isLoader) {
      // Export for CommonJS environments.
      runInContext(root, freeExports);
    } else {
      // Export for web browsers and JavaScript engines.
      var nativeJSON = root.JSON,
          previousJSON = root["JSON3"],
          isRestored = false;

      var JSON3 = runInContext(root, (root["JSON3"] = {
        // Public: Restores the original value of the global `JSON` object and
        // returns a reference to the `JSON3` object.
        "noConflict": function () {
          if (!isRestored) {
            isRestored = true;
            root.JSON = nativeJSON;
            root["JSON3"] = previousJSON;
            nativeJSON = previousJSON = null;
          }
          return JSON3;
        }
      }));

      root.JSON = {
        "parse": JSON3.parse,
        "stringify": JSON3.stringify
      };
    }

    // Export for asynchronous module loaders.
    if (isLoader) {
      undefined(function () {
        return JSON3;
      });
    }
  }).call(commonjsGlobal);
  });

  var version$1 = '1.1.5';

  var iframe = createCommonjsModule$1(function (module) {



  var debug = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug = browser$1('sockjs-client:utils:iframe');
  }

  module.exports = {
    WPrefix: '_jp'
  , currentWindowId: null

  , polluteGlobalNamespace: function() {
      if (!(module.exports.WPrefix in commonjsGlobal)) {
        commonjsGlobal[module.exports.WPrefix] = {};
      }
    }

  , postMessage: function(type, data) {
      if (commonjsGlobal.parent !== commonjsGlobal) {
        commonjsGlobal.parent.postMessage(json3.stringify({
          windowId: module.exports.currentWindowId
        , type: type
        , data: data || ''
        }), '*');
      } else {
        debug('Cannot postMessage, no parent window.', type, data);
      }
    }

  , createIframe: function(iframeUrl, errorCallback) {
      var iframe = commonjsGlobal.document.createElement('iframe');
      var tref, unloadRef;
      var unattach = function() {
        debug('unattach');
        clearTimeout(tref);
        // Explorer had problems with that.
        try {
          iframe.onload = null;
        } catch (x) {
          // intentionally empty
        }
        iframe.onerror = null;
      };
      var cleanup = function() {
        debug('cleanup');
        if (iframe) {
          unattach();
          // This timeout makes chrome fire onbeforeunload event
          // within iframe. Without the timeout it goes straight to
          // onunload.
          setTimeout(function() {
            if (iframe) {
              iframe.parentNode.removeChild(iframe);
            }
            iframe = null;
          }, 0);
          event.unloadDel(unloadRef);
        }
      };
      var onerror = function(err) {
        debug('onerror', err);
        if (iframe) {
          cleanup();
          errorCallback(err);
        }
      };
      var post = function(msg, origin) {
        debug('post', msg, origin);
        setTimeout(function() {
          try {
            // When the iframe is not loaded, IE raises an exception
            // on 'contentWindow'.
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(msg, origin);
            }
          } catch (x) {
            // intentionally empty
          }
        }, 0);
      };

      iframe.src = iframeUrl;
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.onerror = function() {
        onerror('onerror');
      };
      iframe.onload = function() {
        debug('onload');
        // `onload` is triggered before scripts on the iframe are
        // executed. Give it few seconds to actually load stuff.
        clearTimeout(tref);
        tref = setTimeout(function() {
          onerror('onload timeout');
        }, 2000);
      };
      commonjsGlobal.document.body.appendChild(iframe);
      tref = setTimeout(function() {
        onerror('timeout');
      }, 15000);
      unloadRef = event.unloadAdd(cleanup);
      return {
        post: post
      , cleanup: cleanup
      , loaded: unattach
      };
    }

  /* eslint no-undef: "off", new-cap: "off" */
  , createHtmlfile: function(iframeUrl, errorCallback) {
      var axo = ['Active'].concat('Object').join('X');
      var doc = new commonjsGlobal[axo]('htmlfile');
      var tref, unloadRef;
      var iframe;
      var unattach = function() {
        clearTimeout(tref);
        iframe.onerror = null;
      };
      var cleanup = function() {
        if (doc) {
          unattach();
          event.unloadDel(unloadRef);
          iframe.parentNode.removeChild(iframe);
          iframe = doc = null;
          CollectGarbage();
        }
      };
      var onerror = function(r) {
        debug('onerror', r);
        if (doc) {
          cleanup();
          errorCallback(r);
        }
      };
      var post = function(msg, origin) {
        try {
          // When the iframe is not loaded, IE raises an exception
          // on 'contentWindow'.
          setTimeout(function() {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
            }
          }, 0);
        } catch (x) {
          // intentionally empty
        }
      };

      doc.open();
      doc.write('<html><s' + 'cript>' +
                'document.domain="' + commonjsGlobal.document.domain + '";' +
                '</s' + 'cript></html>');
      doc.close();
      doc.parentWindow[module.exports.WPrefix] = commonjsGlobal[module.exports.WPrefix];
      var c = doc.createElement('div');
      doc.body.appendChild(c);
      iframe = doc.createElement('iframe');
      c.appendChild(iframe);
      iframe.src = iframeUrl;
      iframe.onerror = function() {
        onerror('onerror');
      };
      tref = setTimeout(function() {
        onerror('timeout');
      }, 15000);
      unloadRef = event.unloadAdd(cleanup);
      return {
        post: post
      , cleanup: cleanup
      , loaded: unattach
      };
    }
  };

  module.exports.iframeEnabled = false;
  if (commonjsGlobal.document) {
    // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
    // huge delay, or not at all.
    module.exports.iframeEnabled = (typeof commonjsGlobal.postMessage === 'function' ||
      typeof commonjsGlobal.postMessage === 'object') && (!browser$2.isKonqueror());
  }
  });
  var iframe_1 = iframe.WPrefix;
  var iframe_2 = iframe.currentWindowId;
  var iframe_3 = iframe.polluteGlobalNamespace;
  var iframe_4 = iframe.postMessage;
  var iframe_5 = iframe.createIframe;
  var iframe_6 = iframe.createHtmlfile;
  var iframe_7 = iframe.iframeEnabled;

  // Few cool transports do work only for same-origin. In order to make
  // them work cross-domain we shall use iframe, served from the
  // remote domain. New browsers have capabilities to communicate with
  // cross domain iframe using postMessage(). In IE it was implemented
  // from IE 8+, but of course, IE got some details wrong:
  //    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
  //    http://stevesouders.com/misc/test-postmessage.php

  var EventEmitter$8 = emitter.EventEmitter
    ;

  var debug$b = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$b = browser$1('sockjs-client:transport:iframe');
  }

  function IframeTransport(transport, transUrl, baseUrl) {
    if (!IframeTransport.enabled()) {
      throw new Error('Transport created when disabled');
    }
    EventEmitter$8.call(this);

    var self = this;
    this.origin = url.getOrigin(baseUrl);
    this.baseUrl = baseUrl;
    this.transUrl = transUrl;
    this.transport = transport;
    this.windowId = random.string(8);

    var iframeUrl = url.addPath(baseUrl, '/iframe.html') + '#' + this.windowId;
    debug$b(transport, transUrl, iframeUrl);

    this.iframeObj = iframe.createIframe(iframeUrl, function(r) {
      debug$b('err callback');
      self.emit('close', 1006, 'Unable to load an iframe (' + r + ')');
      self.close();
    });

    this.onmessageCallback = this._message.bind(this);
    event.attachEvent('message', this.onmessageCallback);
  }

  inherits_browser(IframeTransport, EventEmitter$8);

  IframeTransport.prototype.close = function() {
    debug$b('close');
    this.removeAllListeners();
    if (this.iframeObj) {
      event.detachEvent('message', this.onmessageCallback);
      try {
        // When the iframe is not loaded, IE raises an exception
        // on 'contentWindow'.
        this.postMessage('c');
      } catch (x) {
        // intentionally empty
      }
      this.iframeObj.cleanup();
      this.iframeObj = null;
      this.onmessageCallback = this.iframeObj = null;
    }
  };

  IframeTransport.prototype._message = function(e) {
    debug$b('message', e.data);
    if (!url.isOriginEqual(e.origin, this.origin)) {
      debug$b('not same origin', e.origin, this.origin);
      return;
    }

    var iframeMessage;
    try {
      iframeMessage = json3.parse(e.data);
    } catch (ignored) {
      debug$b('bad json', e.data);
      return;
    }

    if (iframeMessage.windowId !== this.windowId) {
      debug$b('mismatched window id', iframeMessage.windowId, this.windowId);
      return;
    }

    switch (iframeMessage.type) {
    case 's':
      this.iframeObj.loaded();
      // window global dependency
      this.postMessage('s', json3.stringify([
        version$1
      , this.transport
      , this.transUrl
      , this.baseUrl
      ]));
      break;
    case 't':
      this.emit('message', iframeMessage.data);
      break;
    case 'c':
      var cdata;
      try {
        cdata = json3.parse(iframeMessage.data);
      } catch (ignored) {
        debug$b('bad json', iframeMessage.data);
        return;
      }
      this.emit('close', cdata[0], cdata[1]);
      this.close();
      break;
    }
  };

  IframeTransport.prototype.postMessage = function(type, data) {
    debug$b('postMessage', type, data);
    this.iframeObj.post(json3.stringify({
      windowId: this.windowId
    , type: type
    , data: data || ''
    }), this.origin);
  };

  IframeTransport.prototype.send = function(message) {
    debug$b('send', message);
    this.postMessage('m', message);
  };

  IframeTransport.enabled = function() {
    return iframe.iframeEnabled;
  };

  IframeTransport.transportName = 'iframe';
  IframeTransport.roundTrips = 2;

  var iframe$1 = IframeTransport;

  var object = {
    isObject: function(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    }

  , extend: function(obj) {
      if (!this.isObject(obj)) {
        return obj;
      }
      var source, prop;
      for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
          if (Object.prototype.hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
          }
        }
      }
      return obj;
    }
  };

  var iframeWrap = function(transport) {

    function IframeWrapTransport(transUrl, baseUrl) {
      iframe$1.call(this, transport.transportName, transUrl, baseUrl);
    }

    inherits_browser(IframeWrapTransport, iframe$1);

    IframeWrapTransport.enabled = function(url, info) {
      if (!commonjsGlobal.document) {
        return false;
      }

      var iframeInfo = object.extend({}, info);
      iframeInfo.sameOrigin = true;
      return transport.enabled(iframeInfo) && iframe$1.enabled();
    };

    IframeWrapTransport.transportName = 'iframe-' + transport.transportName;
    IframeWrapTransport.needBody = true;
    IframeWrapTransport.roundTrips = iframe$1.roundTrips + transport.roundTrips - 1; // html, javascript (2) + transport - no CORS (1)

    IframeWrapTransport.facadeTransport = transport;

    return IframeWrapTransport;
  };

  var EventEmitter$9 = emitter.EventEmitter
    ;

  var debug$c = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$c = browser$1('sockjs-client:receiver:htmlfile');
  }

  function HtmlfileReceiver(url$$1) {
    debug$c(url$$1);
    EventEmitter$9.call(this);
    var self = this;
    iframe.polluteGlobalNamespace();

    this.id = 'a' + random.string(6);
    url$$1 = url.addQuery(url$$1, 'c=' + decodeURIComponent(iframe.WPrefix + '.' + this.id));

    debug$c('using htmlfile', HtmlfileReceiver.htmlfileEnabled);
    var constructFunc = HtmlfileReceiver.htmlfileEnabled ?
        iframe.createHtmlfile : iframe.createIframe;

    commonjsGlobal[iframe.WPrefix][this.id] = {
      start: function() {
        debug$c('start');
        self.iframeObj.loaded();
      }
    , message: function(data) {
        debug$c('message', data);
        self.emit('message', data);
      }
    , stop: function() {
        debug$c('stop');
        self._cleanup();
        self._close('network');
      }
    };
    this.iframeObj = constructFunc(url$$1, function() {
      debug$c('callback');
      self._cleanup();
      self._close('permanent');
    });
  }

  inherits_browser(HtmlfileReceiver, EventEmitter$9);

  HtmlfileReceiver.prototype.abort = function() {
    debug$c('abort');
    this._cleanup();
    this._close('user');
  };

  HtmlfileReceiver.prototype._cleanup = function() {
    debug$c('_cleanup');
    if (this.iframeObj) {
      this.iframeObj.cleanup();
      this.iframeObj = null;
    }
    delete commonjsGlobal[iframe.WPrefix][this.id];
  };

  HtmlfileReceiver.prototype._close = function(reason) {
    debug$c('_close', reason);
    this.emit('close', null, reason);
    this.removeAllListeners();
  };

  HtmlfileReceiver.htmlfileEnabled = false;

  // obfuscate to avoid firewalls
  var axo$1 = ['Active'].concat('Object').join('X');
  if (axo$1 in commonjsGlobal) {
    try {
      HtmlfileReceiver.htmlfileEnabled = !!new commonjsGlobal[axo$1]('htmlfile');
    } catch (x) {
      // intentionally empty
    }
  }

  HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframe.iframeEnabled;

  var htmlfile = HtmlfileReceiver;

  function HtmlFileTransport(transUrl) {
    if (!htmlfile.enabled) {
      throw new Error('Transport created when disabled');
    }
    ajaxBased.call(this, transUrl, '/htmlfile', htmlfile, xhrLocal);
  }

  inherits_browser(HtmlFileTransport, ajaxBased);

  HtmlFileTransport.enabled = function(info) {
    return htmlfile.enabled && info.sameOrigin;
  };

  HtmlFileTransport.transportName = 'htmlfile';
  HtmlFileTransport.roundTrips = 2;

  var htmlfile$1 = HtmlFileTransport;

  function XhrPollingTransport(transUrl) {
    if (!xhrLocal.enabled && !xhrCors.enabled) {
      throw new Error('Transport created when disabled');
    }
    ajaxBased.call(this, transUrl, '/xhr', xhr$1, xhrCors);
  }

  inherits_browser(XhrPollingTransport, ajaxBased);

  XhrPollingTransport.enabled = function(info) {
    if (info.nullOrigin) {
      return false;
    }

    if (xhrLocal.enabled && info.sameOrigin) {
      return true;
    }
    return xhrCors.enabled;
  };

  XhrPollingTransport.transportName = 'xhr-polling';
  XhrPollingTransport.roundTrips = 2; // preflight, ajax

  var xhrPolling = XhrPollingTransport;

  function XdrPollingTransport(transUrl) {
    if (!xdr.enabled) {
      throw new Error('Transport created when disabled');
    }
    ajaxBased.call(this, transUrl, '/xhr', xhr$1, xdr);
  }

  inherits_browser(XdrPollingTransport, ajaxBased);

  XdrPollingTransport.enabled = xdrStreaming.enabled;
  XdrPollingTransport.transportName = 'xdr-polling';
  XdrPollingTransport.roundTrips = 2; // preflight, ajax

  var xdrPolling = XdrPollingTransport;

  var EventEmitter$a = emitter.EventEmitter
    ;

  var debug$d = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$d = browser$1('sockjs-client:receiver:jsonp');
  }

  function JsonpReceiver(url$$1) {
    debug$d(url$$1);
    var self = this;
    EventEmitter$a.call(this);

    iframe.polluteGlobalNamespace();

    this.id = 'a' + random.string(6);
    var urlWithId = url.addQuery(url$$1, 'c=' + encodeURIComponent(iframe.WPrefix + '.' + this.id));

    commonjsGlobal[iframe.WPrefix][this.id] = this._callback.bind(this);
    this._createScript(urlWithId);

    // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
    this.timeoutId = setTimeout(function() {
      debug$d('timeout');
      self._abort(new Error('JSONP script loaded abnormally (timeout)'));
    }, JsonpReceiver.timeout);
  }

  inherits_browser(JsonpReceiver, EventEmitter$a);

  JsonpReceiver.prototype.abort = function() {
    debug$d('abort');
    if (commonjsGlobal[iframe.WPrefix][this.id]) {
      var err = new Error('JSONP user aborted read');
      err.code = 1000;
      this._abort(err);
    }
  };

  JsonpReceiver.timeout = 35000;
  JsonpReceiver.scriptErrorTimeout = 1000;

  JsonpReceiver.prototype._callback = function(data) {
    debug$d('_callback', data);
    this._cleanup();

    if (this.aborting) {
      return;
    }

    if (data) {
      debug$d('message', data);
      this.emit('message', data);
    }
    this.emit('close', null, 'network');
    this.removeAllListeners();
  };

  JsonpReceiver.prototype._abort = function(err) {
    debug$d('_abort', err);
    this._cleanup();
    this.aborting = true;
    this.emit('close', err.code, err.message);
    this.removeAllListeners();
  };

  JsonpReceiver.prototype._cleanup = function() {
    debug$d('_cleanup');
    clearTimeout(this.timeoutId);
    if (this.script2) {
      this.script2.parentNode.removeChild(this.script2);
      this.script2 = null;
    }
    if (this.script) {
      var script = this.script;
      // Unfortunately, you can't really abort script loading of
      // the script.
      script.parentNode.removeChild(script);
      script.onreadystatechange = script.onerror =
          script.onload = script.onclick = null;
      this.script = null;
    }
    delete commonjsGlobal[iframe.WPrefix][this.id];
  };

  JsonpReceiver.prototype._scriptError = function() {
    debug$d('_scriptError');
    var self = this;
    if (this.errorTimer) {
      return;
    }

    this.errorTimer = setTimeout(function() {
      if (!self.loadedOkay) {
        self._abort(new Error('JSONP script loaded abnormally (onerror)'));
      }
    }, JsonpReceiver.scriptErrorTimeout);
  };

  JsonpReceiver.prototype._createScript = function(url$$1) {
    debug$d('_createScript', url$$1);
    var self = this;
    var script = this.script = commonjsGlobal.document.createElement('script');
    var script2;  // Opera synchronous load trick.

    script.id = 'a' + random.string(8);
    script.src = url$$1;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.onerror = this._scriptError.bind(this);
    script.onload = function() {
      debug$d('onload');
      self._abort(new Error('JSONP script loaded abnormally (onload)'));
    };

    // IE9 fires 'error' event after onreadystatechange or before, in random order.
    // Use loadedOkay to determine if actually errored
    script.onreadystatechange = function() {
      debug$d('onreadystatechange', script.readyState);
      if (/loaded|closed/.test(script.readyState)) {
        if (script && script.htmlFor && script.onclick) {
          self.loadedOkay = true;
          try {
            // In IE, actually execute the script.
            script.onclick();
          } catch (x) {
            // intentionally empty
          }
        }
        if (script) {
          self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
        }
      }
    };
    // IE: event/htmlFor/onclick trick.
    // One can't rely on proper order for onreadystatechange. In order to
    // make sure, set a 'htmlFor' and 'event' properties, so that
    // script code will be installed as 'onclick' handler for the
    // script object. Later, onreadystatechange, manually execute this
    // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
    // set. For reference see:
    //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
    // Also, read on that about script ordering:
    //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
    if (typeof script.async === 'undefined' && commonjsGlobal.document.attachEvent) {
      // According to mozilla docs, in recent browsers script.async defaults
      // to 'true', so we may use it to detect a good browser:
      // https://developer.mozilla.org/en/HTML/Element/script
      if (!browser$2.isOpera()) {
        // Naively assume we're in IE
        try {
          script.htmlFor = script.id;
          script.event = 'onclick';
        } catch (x) {
          // intentionally empty
        }
        script.async = true;
      } else {
        // Opera, second sync script hack
        script2 = this.script2 = commonjsGlobal.document.createElement('script');
        script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
        script.async = script2.async = false;
      }
    }
    if (typeof script.async !== 'undefined') {
      script.async = true;
    }

    var head = commonjsGlobal.document.getElementsByTagName('head')[0];
    head.insertBefore(script, head.firstChild);
    if (script2) {
      head.insertBefore(script2, head.firstChild);
    }
  };

  var jsonp = JsonpReceiver;

  var debug$e = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$e = browser$1('sockjs-client:sender:jsonp');
  }

  var form, area;

  function createIframe(id) {
    debug$e('createIframe', id);
    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      return commonjsGlobal.document.createElement('<iframe name="' + id + '">');
    } catch (x) {
      var iframe = commonjsGlobal.document.createElement('iframe');
      iframe.name = id;
      return iframe;
    }
  }

  function createForm() {
    debug$e('createForm');
    form = commonjsGlobal.document.createElement('form');
    form.style.display = 'none';
    form.style.position = 'absolute';
    form.method = 'POST';
    form.enctype = 'application/x-www-form-urlencoded';
    form.acceptCharset = 'UTF-8';

    area = commonjsGlobal.document.createElement('textarea');
    area.name = 'd';
    form.appendChild(area);

    commonjsGlobal.document.body.appendChild(form);
  }

  var jsonp$1 = function(url$$1, payload, callback) {
    debug$e(url$$1, payload);
    if (!form) {
      createForm();
    }
    var id = 'a' + random.string(8);
    form.target = id;
    form.action = url.addQuery(url.addPath(url$$1, '/jsonp_send'), 'i=' + id);

    var iframe = createIframe(id);
    iframe.id = id;
    iframe.style.display = 'none';
    form.appendChild(iframe);

    try {
      area.value = payload;
    } catch (e) {
      // seriously broken browsers get here
    }
    form.submit();

    var completed = function(err) {
      debug$e('completed', id, err);
      if (!iframe.onerror) {
        return;
      }
      iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
      // Opera mini doesn't like if we GC iframe
      // immediately, thus this timeout.
      setTimeout(function() {
        debug$e('cleaning up', id);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
      }, 500);
      area.value = '';
      // It is not possible to detect if the iframe succeeded or
      // failed to submit our form.
      callback(err);
    };
    iframe.onerror = function() {
      debug$e('onerror', id);
      completed();
    };
    iframe.onload = function() {
      debug$e('onload', id);
      completed();
    };
    iframe.onreadystatechange = function(e) {
      debug$e('onreadystatechange', id, iframe.readyState, e);
      if (iframe.readyState === 'complete') {
        completed();
      }
    };
    return function() {
      debug$e('aborted', id);
      completed(new Error('Aborted'));
    };
  };

  // The simplest and most robust transport, using the well-know cross
  // domain hack - JSONP. This transport is quite inefficient - one
  // message could use up to one http request. But at least it works almost
  // everywhere.
  // Known limitations:
  //   o you will get a spinning cursor
  //   o for Konqueror a dumb timer is needed to detect errors



  function JsonPTransport(transUrl) {
    if (!JsonPTransport.enabled()) {
      throw new Error('Transport created when disabled');
    }
    senderReceiver.call(this, transUrl, '/jsonp', jsonp$1, jsonp);
  }

  inherits_browser(JsonPTransport, senderReceiver);

  JsonPTransport.enabled = function() {
    return !!commonjsGlobal.document;
  };

  JsonPTransport.transportName = 'jsonp-polling';
  JsonPTransport.roundTrips = 1;
  JsonPTransport.needBody = true;

  var jsonpPolling = JsonPTransport;

  var transportList = [
    // streaming transports
    websocket$2
  , xhrStreaming
  , xdrStreaming
  , eventsource$2
  , iframeWrap(eventsource$2)

    // polling transports
  , htmlfile$1
  , iframeWrap(htmlfile$1)
  , xhrPolling
  , xdrPolling
  , iframeWrap(xhrPolling)
  , jsonpPolling
  ];

  /* eslint-disable */

  // pulled specific shims from https://github.com/es-shims/es5-shim

  var ArrayPrototype = Array.prototype;
  var ObjectPrototype = Object.prototype;
  var FunctionPrototype = Function.prototype;
  var StringPrototype = String.prototype;
  var array_slice = ArrayPrototype.slice;

  var _toString = ObjectPrototype.toString;
  var isFunction$1 = function (val) {
      return ObjectPrototype.toString.call(val) === '[object Function]';
  };
  var isArray$1 = function isArray(obj) {
      return _toString.call(obj) === '[object Array]';
  };
  var isString$1 = function isString(obj) {
      return _toString.call(obj) === '[object String]';
  };

  var supportsDescriptors = Object.defineProperty && (function () {
      try {
          Object.defineProperty({}, 'x', {});
          return true;
      } catch (e) { /* this is ES3 */
          return false;
      }
  }());

  // Define configurable, writable and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  var defineProperties = function (object, map, forceAssign) {
      for (var name in map) {
          if (ObjectPrototype.hasOwnProperty.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };

  var toObject = function (o) {
      if (o == null) { // this matches both null and undefined
          throw new TypeError("can't convert " + o + ' to object');
      }
      return Object(o);
  };

  //
  // Util
  // ======
  //

  // ES5 9.4
  // http://es5.github.com/#x9.4
  // http://jsperf.com/to-integer

  function toInteger(num) {
      var n = +num;
      if (n !== n) { // isNaN
          n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
      return n;
  }

  function ToUint32(x) {
      return x >>> 0;
  }

  //
  // Function
  // ========
  //

  // ES-5 15.3.4.5
  // http://es5.github.com/#x15.3.4.5

  function Empty() {}

  defineProperties(FunctionPrototype, {
      bind: function bind(that) { // .length is 1
          // 1. Let Target be the this value.
          var target = this;
          // 2. If IsCallable(Target) is false, throw a TypeError exception.
          if (!isFunction$1(target)) {
              throw new TypeError('Function.prototype.bind called on incompatible ' + target);
          }
          // 3. Let A be a new (possibly empty) internal list of all of the
          //   argument values provided after thisArg (arg1, arg2 etc), in order.
          // XXX slicedArgs will stand in for "A" if used
          var args = array_slice.call(arguments, 1); // for normal call
          // 4. Let F be a new native ECMAScript object.
          // 11. Set the [[Prototype]] internal property of F to the standard
          //   built-in Function prototype object as specified in 15.3.3.1.
          // 12. Set the [[Call]] internal property of F as described in
          //   15.3.4.5.1.
          // 13. Set the [[Construct]] internal property of F as described in
          //   15.3.4.5.2.
          // 14. Set the [[HasInstance]] internal property of F as described in
          //   15.3.4.5.3.
          var binder = function () {

              if (this instanceof bound) {
                  // 15.3.4.5.2 [[Construct]]
                  // When the [[Construct]] internal method of a function object,
                  // F that was created using the bind function is called with a
                  // list of arguments ExtraArgs, the following steps are taken:
                  // 1. Let target be the value of F's [[TargetFunction]]
                  //   internal property.
                  // 2. If target has no [[Construct]] internal method, a
                  //   TypeError exception is thrown.
                  // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                  //   property.
                  // 4. Let args be a new list containing the same values as the
                  //   list boundArgs in the same order followed by the same
                  //   values as the list ExtraArgs in the same order.
                  // 5. Return the result of calling the [[Construct]] internal
                  //   method of target providing args as the arguments.

                  var result = target.apply(
                      this,
                      args.concat(array_slice.call(arguments))
                  );
                  if (Object(result) === result) {
                      return result;
                  }
                  return this;

              } else {
                  // 15.3.4.5.1 [[Call]]
                  // When the [[Call]] internal method of a function object, F,
                  // which was created using the bind function is called with a
                  // this value and a list of arguments ExtraArgs, the following
                  // steps are taken:
                  // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                  //   property.
                  // 2. Let boundThis be the value of F's [[BoundThis]] internal
                  //   property.
                  // 3. Let target be the value of F's [[TargetFunction]] internal
                  //   property.
                  // 4. Let args be a new list containing the same values as the
                  //   list boundArgs in the same order followed by the same
                  //   values as the list ExtraArgs in the same order.
                  // 5. Return the result of calling the [[Call]] internal method
                  //   of target providing boundThis as the this value and
                  //   providing args as the arguments.

                  // equiv: target.call(this, ...boundArgs, ...args)
                  return target.apply(
                      that,
                      args.concat(array_slice.call(arguments))
                  );

              }

          };

          // 15. If the [[Class]] internal property of Target is "Function", then
          //     a. Let L be the length property of Target minus the length of A.
          //     b. Set the length own property of F to either 0 or L, whichever is
          //       larger.
          // 16. Else set the length own property of F to 0.

          var boundLength = Math.max(0, target.length - args.length);

          // 17. Set the attributes of the length own property of F to the values
          //   specified in 15.3.5.1.
          var boundArgs = [];
          for (var i = 0; i < boundLength; i++) {
              boundArgs.push('$' + i);
          }

          // XXX Build a dynamic function with desired amount of arguments is the only
          // way to set the length property of a function.
          // In environments where Content Security Policies enabled (Chrome extensions,
          // for ex.) all use of eval or Function costructor throws an exception.
          // However in all of these environments Function.prototype.bind exists
          // and so this code will never be executed.
          var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

          if (target.prototype) {
              Empty.prototype = target.prototype;
              bound.prototype = new Empty();
              // Clean up dangling references.
              Empty.prototype = null;
          }

          // TODO
          // 18. Set the [[Extensible]] internal property of F to true.

          // TODO
          // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
          // 20. Call the [[DefineOwnProperty]] internal method of F with
          //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
          //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
          //   false.
          // 21. Call the [[DefineOwnProperty]] internal method of F with
          //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
          //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
          //   and false.

          // TODO
          // NOTE Function objects created using Function.prototype.bind do not
          // have a prototype property or the [[Code]], [[FormalParameters]], and
          // [[Scope]] internal properties.
          // XXX can't delete prototype in pure-js.

          // 22. Return F.
          return bound;
      }
  });

  //
  // Array
  // =====
  //

  // ES5 15.4.3.2
  // http://es5.github.com/#x15.4.3.2
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
  defineProperties(Array, { isArray: isArray$1 });


  var boxedString = Object('a');
  var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

  var properlyBoxesContext = function properlyBoxed(method) {
      // Check node 0.6.21 bug where third parameter is not boxed
      var properlyBoxesNonStrict = true;
      var properlyBoxesStrict = true;
      if (method) {
          method.call('foo', function (_, __, context) {
              if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
          });

          method.call([1], function () {
              properlyBoxesStrict = typeof this === 'string';
          }, 'x');
      }
      return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
  };

  defineProperties(ArrayPrototype, {
      forEach: function forEach(fun /*, thisp*/) {
          var object = toObject(this),
              self = splitString && isString$1(this) ? this.split('') : object,
              thisp = arguments[1],
              i = -1,
              length = self.length >>> 0;

          // If no callback function or if callback is not a callable function
          if (!isFunction$1(fun)) {
              throw new TypeError(); // TODO message
          }

          while (++i < length) {
              if (i in self) {
                  // Invoke the callback function with call, passing arguments:
                  // context, property value, property key, thisArg object
                  // context
                  fun.call(thisp, self[i], i, object);
              }
          }
      }
  }, !properlyBoxesContext(ArrayPrototype.forEach));

  // ES5 15.4.4.14
  // http://es5.github.com/#x15.4.4.14
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
  var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
  defineProperties(ArrayPrototype, {
      indexOf: function indexOf(sought /*, fromIndex */ ) {
          var self = splitString && isString$1(this) ? this.split('') : toObject(this),
              length = self.length >>> 0;

          if (!length) {
              return -1;
          }

          var i = 0;
          if (arguments.length > 1) {
              i = toInteger(arguments[1]);
          }

          // handle negative indices
          i = i >= 0 ? i : Math.max(0, length + i);
          for (; i < length; i++) {
              if (i in self && self[i] === sought) {
                  return i;
              }
          }
          return -1;
      }
  }, hasFirefox2IndexOfBug);

  //
  // String
  // ======
  //

  // ES5 15.5.4.14
  // http://es5.github.com/#x15.5.4.14

  // [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
  // Many browsers do not split properly with regular expressions or they
  // do not perform the split correctly under obscure conditions.
  // See http://blog.stevenlevithan.com/archives/cross-browser-split
  // I've tested in many browsers and this seems to cover the deviant ones:
  //    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
  //    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
  //    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
  //       [undefined, "t", undefined, "e", ...]
  //    ''.split(/.?/) should be [], not [""]
  //    '.'.split(/()()/) should be ["."], not ["", "", "."]

  var string_split = StringPrototype.split;
  if (
      'ab'.split(/(?:ab)*/).length !== 2 ||
      '.'.split(/(.?)(.?)/).length !== 4 ||
      'tesst'.split(/(s)*/)[1] === 't' ||
      'test'.split(/(?:)/, -1).length !== 4 ||
      ''.split(/.?/).length ||
      '.'.split(/()()/).length > 1
  ) {
      (function () {
          var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

          StringPrototype.split = function (separator, limit) {
              var string = this;
              if (separator === void 0 && limit === 0) {
                  return [];
              }

              // If `separator` is not a regex, use native split
              if (_toString.call(separator) !== '[object RegExp]') {
                  return string_split.call(this, separator, limit);
              }

              var output = [],
                  flags = (separator.ignoreCase ? 'i' : '') +
                          (separator.multiline  ? 'm' : '') +
                          (separator.extended   ? 'x' : '') + // Proposed for ES6
                          (separator.sticky     ? 'y' : ''), // Firefox 3+
                  lastLastIndex = 0,
                  // Make `global` and avoid `lastIndex` issues by working with a copy
                  separator2, match, lastIndex, lastLength;
              separator = new RegExp(separator.source, flags + 'g');
              string += ''; // Type-convert
              if (!compliantExecNpcg) {
                  // Doesn't need flags gy, but they don't hurt
                  separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
              }
              /* Values for `limit`, per the spec:
               * If undefined: 4294967295 // Math.pow(2, 32) - 1
               * If 0, Infinity, or NaN: 0
               * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
               * If negative number: 4294967296 - Math.floor(Math.abs(limit))
               * If other: Type-convert, then use the above rules
               */
              limit = limit === void 0 ?
                  -1 >>> 0 : // Math.pow(2, 32) - 1
                  ToUint32(limit);
              while (match = separator.exec(string)) {
                  // `separator.lastIndex` is not reliable cross-browser
                  lastIndex = match.index + match[0].length;
                  if (lastIndex > lastLastIndex) {
                      output.push(string.slice(lastLastIndex, match.index));
                      // Fix browsers whose `exec` methods don't consistently return `undefined` for
                      // nonparticipating capturing groups
                      if (!compliantExecNpcg && match.length > 1) {
                          match[0].replace(separator2, function () {
                              for (var i = 1; i < arguments.length - 2; i++) {
                                  if (arguments[i] === void 0) {
                                      match[i] = void 0;
                                  }
                              }
                          });
                      }
                      if (match.length > 1 && match.index < string.length) {
                          ArrayPrototype.push.apply(output, match.slice(1));
                      }
                      lastLength = match[0].length;
                      lastLastIndex = lastIndex;
                      if (output.length >= limit) {
                          break;
                      }
                  }
                  if (separator.lastIndex === match.index) {
                      separator.lastIndex++; // Avoid an infinite loop
                  }
              }
              if (lastLastIndex === string.length) {
                  if (lastLength || !separator.test('')) {
                      output.push('');
                  }
              } else {
                  output.push(string.slice(lastLastIndex));
              }
              return output.length > limit ? output.slice(0, limit) : output;
          };
      }());

  // [bugfix, chrome]
  // If separator is undefined, then the result array contains just one String,
  // which is the this value (converted to a String). If limit is not undefined,
  // then the output array is truncated so that it contains no more than limit
  // elements.
  // "0".split(undefined, 0) -> []
  } else if ('0'.split(void 0, 0).length) {
      StringPrototype.split = function split(separator, limit) {
          if (separator === void 0 && limit === 0) { return []; }
          return string_split.call(this, separator, limit);
      };
  }

  // ECMA-262, 3rd B.2.3
  // Not an ECMAScript standard, although ECMAScript 3rd Edition has a
  // non-normative section suggesting uniform semantics and it should be
  // normalized across all browsers
  // [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
  var string_substr = StringPrototype.substr;
  var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
  defineProperties(StringPrototype, {
      substr: function substr(start, length) {
          return string_substr.call(
              this,
              start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
              length
          );
      }
  }, hasNegativeSubstrBug);

  // Some extra characters that Chrome gets wrong, and substitutes with
  // something else on the wire.
  // eslint-disable-next-line no-control-regex
  var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g
    , extraLookup;

  // This may be quite slow, so let's delay until user actually uses bad
  // characters.
  var unrollLookup = function(escapable) {
    var unrolled = {};
    escapable.lastIndex = 0;
    escapable.lastIndex = 0;
    return unrolled;
  };

  // Quote string, also taking care of unicode characters that browsers
  // often break. Especially, take care of unicode surrogates:
  // http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
  var _escape = {
    quote: function(string) {
      var quoted = json3.stringify(string);

      // In most cases this should be very fast and good enough.
      extraEscapable.lastIndex = 0;
      if (!extraEscapable.test(quoted)) {
        return quoted;
      }

      if (!extraLookup) {
        extraLookup = unrollLookup(extraEscapable);
      }

      return quoted.replace(extraEscapable, function(a) {
        return extraLookup[a];
      });
    }
  };

  var debug$f = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$f = browser$1('sockjs-client:utils:transport');
  }

  var transport = function(availableTransports) {
    return {
      filterToEnabled: function(transportsWhitelist, info) {
        var transports = {
          main: []
        , facade: []
        };
        if (!transportsWhitelist) {
          transportsWhitelist = [];
        } else if (typeof transportsWhitelist === 'string') {
          transportsWhitelist = [transportsWhitelist];
        }

        availableTransports.forEach(function(trans) {
          if (!trans) {
            return;
          }

          if (trans.transportName === 'websocket' && info.websocket === false) {
            debug$f('disabled from server', 'websocket');
            return;
          }

          if (transportsWhitelist.length &&
              transportsWhitelist.indexOf(trans.transportName) === -1) {
            debug$f('not in whitelist', trans.transportName);
            return;
          }

          if (trans.enabled(info)) {
            debug$f('enabled', trans.transportName);
            transports.main.push(trans);
            if (trans.facadeTransport) {
              transports.facade.push(trans.facadeTransport);
            }
          } else {
            debug$f('disabled', trans.transportName);
          }
        });
        return transports;
      }
    };
  };

  var logObject = {};
  ['log', 'debug', 'warn'].forEach(function (level) {
    var levelExists;

    try {
      levelExists = commonjsGlobal.console && commonjsGlobal.console[level] && commonjsGlobal.console[level].apply;
    } catch(e) {
      // do nothing
    }

    logObject[level] = levelExists ? function () {
      return commonjsGlobal.console[level].apply(commonjsGlobal.console, arguments);
    } : (level === 'log' ? function () {} : logObject.log);
  });

  var log = logObject;

  function Event(eventType) {
    this.type = eventType;
  }

  Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
    this.type = eventType;
    this.bubbles = canBubble;
    this.cancelable = cancelable;
    this.timeStamp = +new Date();
    return this;
  };

  Event.prototype.stopPropagation = function() {};
  Event.prototype.preventDefault = function() {};

  Event.CAPTURING_PHASE = 1;
  Event.AT_TARGET = 2;
  Event.BUBBLING_PHASE = 3;

  var event$1 = Event;

  var location = commonjsGlobal.location || {
    origin: 'http://localhost:80'
  , protocol: 'http:'
  , host: 'localhost'
  , port: 80
  , href: 'http://localhost/'
  , hash: ''
  };

  function CloseEvent() {
    event$1.call(this);
    this.initEvent('close', false, false);
    this.wasClean = false;
    this.code = 0;
    this.reason = '';
  }

  inherits_browser(CloseEvent, event$1);

  var close = CloseEvent;

  function TransportMessageEvent(data) {
    event$1.call(this);
    this.initEvent('message', false, false);
    this.data = data;
  }

  inherits_browser(TransportMessageEvent, event$1);

  var transMessage = TransportMessageEvent;

  var EventEmitter$b = emitter.EventEmitter
    ;

  function XHRFake(/* method, url, payload, opts */) {
    var self = this;
    EventEmitter$b.call(this);

    this.to = setTimeout(function() {
      self.emit('finish', 200, '{}');
    }, XHRFake.timeout);
  }

  inherits_browser(XHRFake, EventEmitter$b);

  XHRFake.prototype.close = function() {
    clearTimeout(this.to);
  };

  XHRFake.timeout = 2000;

  var xhrFake = XHRFake;

  var EventEmitter$c = emitter.EventEmitter
    ;

  var debug$g = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$g = browser$1('sockjs-client:info-ajax');
  }

  function InfoAjax(url, AjaxObject) {
    EventEmitter$c.call(this);

    var self = this;
    var t0 = +new Date();
    this.xo = new AjaxObject('GET', url);

    this.xo.once('finish', function(status, text) {
      var info, rtt;
      if (status === 200) {
        rtt = (+new Date()) - t0;
        if (text) {
          try {
            info = json3.parse(text);
          } catch (e) {
            debug$g('bad json', text);
          }
        }

        if (!object.isObject(info)) {
          info = {};
        }
      }
      self.emit('finish', info, rtt);
      self.removeAllListeners();
    });
  }

  inherits_browser(InfoAjax, EventEmitter$c);

  InfoAjax.prototype.close = function() {
    this.removeAllListeners();
    this.xo.close();
  };

  var infoAjax = InfoAjax;

  var EventEmitter$d = emitter.EventEmitter
    ;

  function InfoReceiverIframe(transUrl) {
    var self = this;
    EventEmitter$d.call(this);

    this.ir = new infoAjax(transUrl, xhrLocal);
    this.ir.once('finish', function(info, rtt) {
      self.ir = null;
      self.emit('message', json3.stringify([info, rtt]));
    });
  }

  inherits_browser(InfoReceiverIframe, EventEmitter$d);

  InfoReceiverIframe.transportName = 'iframe-info-receiver';

  InfoReceiverIframe.prototype.close = function() {
    if (this.ir) {
      this.ir.close();
      this.ir = null;
    }
    this.removeAllListeners();
  };

  var infoIframeReceiver = InfoReceiverIframe;

  var EventEmitter$e = emitter.EventEmitter
    ;

  var debug$h = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$h = browser$1('sockjs-client:info-iframe');
  }

  function InfoIframe(baseUrl, url) {
    var self = this;
    EventEmitter$e.call(this);

    var go = function() {
      var ifr = self.ifr = new iframe$1(infoIframeReceiver.transportName, url, baseUrl);

      ifr.once('message', function(msg) {
        if (msg) {
          var d;
          try {
            d = json3.parse(msg);
          } catch (e) {
            debug$h('bad json', msg);
            self.emit('finish');
            self.close();
            return;
          }

          var info = d[0], rtt = d[1];
          self.emit('finish', info, rtt);
        }
        self.close();
      });

      ifr.once('close', function() {
        self.emit('finish');
        self.close();
      });
    };

    // TODO this seems the same as the 'needBody' from transports
    if (!commonjsGlobal.document.body) {
      event.attachEvent('load', go);
    } else {
      go();
    }
  }

  inherits_browser(InfoIframe, EventEmitter$e);

  InfoIframe.enabled = function() {
    return iframe$1.enabled();
  };

  InfoIframe.prototype.close = function() {
    if (this.ifr) {
      this.ifr.close();
    }
    this.removeAllListeners();
    this.ifr = null;
  };

  var infoIframe = InfoIframe;

  var EventEmitter$f = emitter.EventEmitter
    ;

  var debug$i = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$i = browser$1('sockjs-client:info-receiver');
  }

  function InfoReceiver(baseUrl, urlInfo) {
    debug$i(baseUrl);
    var self = this;
    EventEmitter$f.call(this);

    setTimeout(function() {
      self.doXhr(baseUrl, urlInfo);
    }, 0);
  }

  inherits_browser(InfoReceiver, EventEmitter$f);

  // TODO this is currently ignoring the list of available transports and the whitelist

  InfoReceiver._getReceiver = function(baseUrl, url$$1, urlInfo) {
    // determine method of CORS support (if needed)
    if (urlInfo.sameOrigin) {
      return new infoAjax(url$$1, xhrLocal);
    }
    if (xhrCors.enabled) {
      return new infoAjax(url$$1, xhrCors);
    }
    if (xdr.enabled && urlInfo.sameScheme) {
      return new infoAjax(url$$1, xdr);
    }
    if (infoIframe.enabled()) {
      return new infoIframe(baseUrl, url$$1);
    }
    return new infoAjax(url$$1, xhrFake);
  };

  InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
    var self = this
      , url$$1 = url.addPath(baseUrl, '/info')
      ;
    debug$i('doXhr', url$$1);

    this.xo = InfoReceiver._getReceiver(baseUrl, url$$1, urlInfo);

    this.timeoutRef = setTimeout(function() {
      debug$i('timeout');
      self._cleanup(false);
      self.emit('finish');
    }, InfoReceiver.timeout);

    this.xo.once('finish', function(info, rtt) {
      debug$i('finish', info, rtt);
      self._cleanup(true);
      self.emit('finish', info, rtt);
    });
  };

  InfoReceiver.prototype._cleanup = function(wasClean) {
    debug$i('_cleanup');
    clearTimeout(this.timeoutRef);
    this.timeoutRef = null;
    if (!wasClean && this.xo) {
      this.xo.close();
    }
    this.xo = null;
  };

  InfoReceiver.prototype.close = function() {
    debug$i('close');
    this.removeAllListeners();
    this._cleanup(false);
  };

  InfoReceiver.timeout = 8000;

  var infoReceiver = InfoReceiver;

  function FacadeJS(transport) {
    this._transport = transport;
    transport.on('message', this._transportMessage.bind(this));
    transport.on('close', this._transportClose.bind(this));
  }

  FacadeJS.prototype._transportClose = function(code, reason) {
    iframe.postMessage('c', json3.stringify([code, reason]));
  };
  FacadeJS.prototype._transportMessage = function(frame) {
    iframe.postMessage('t', frame);
  };
  FacadeJS.prototype._send = function(data) {
    this._transport.send(data);
  };
  FacadeJS.prototype._close = function() {
    this._transport.close();
    this._transport.removeAllListeners();
  };

  var facade = FacadeJS;

  var debug$j = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$j = browser$1('sockjs-client:iframe-bootstrap');
  }

  var iframeBootstrap = function(SockJS, availableTransports) {
    var transportMap = {};
    availableTransports.forEach(function(at) {
      if (at.facadeTransport) {
        transportMap[at.facadeTransport.transportName] = at.facadeTransport;
      }
    });

    // hard-coded for the info iframe
    // TODO see if we can make this more dynamic
    transportMap[infoIframeReceiver.transportName] = infoIframeReceiver;
    var parentOrigin;

    /* eslint-disable camelcase */
    SockJS.bootstrap_iframe = function() {
      /* eslint-enable camelcase */
      var facade$$1;
      iframe.currentWindowId = location.hash.slice(1);
      var onMessage = function(e) {
        if (e.source !== parent) {
          return;
        }
        if (typeof parentOrigin === 'undefined') {
          parentOrigin = e.origin;
        }
        if (e.origin !== parentOrigin) {
          return;
        }

        var iframeMessage;
        try {
          iframeMessage = json3.parse(e.data);
        } catch (ignored) {
          debug$j('bad json', e.data);
          return;
        }

        if (iframeMessage.windowId !== iframe.currentWindowId) {
          return;
        }
        switch (iframeMessage.type) {
        case 's':
          var p;
          try {
            p = json3.parse(iframeMessage.data);
          } catch (ignored) {
            debug$j('bad json', iframeMessage.data);
            break;
          }
          var version$$1 = p[0];
          var transport = p[1];
          var transUrl = p[2];
          var baseUrl = p[3];
          debug$j(version$$1, transport, transUrl, baseUrl);
          // change this to semver logic
          if (version$$1 !== SockJS.version) {
            throw new Error('Incompatible SockJS! Main site uses:' +
                      ' "' + version$$1 + '", the iframe:' +
                      ' "' + SockJS.version + '".');
          }

          if (!url.isOriginEqual(transUrl, location.href) ||
              !url.isOriginEqual(baseUrl, location.href)) {
            throw new Error('Can\'t connect to different domain from within an ' +
                      'iframe. (' + location.href + ', ' + transUrl + ', ' + baseUrl + ')');
          }
          facade$$1 = new facade(new transportMap[transport](transUrl, baseUrl));
          break;
        case 'm':
          facade$$1._send(iframeMessage.data);
          break;
        case 'c':
          if (facade$$1) {
            facade$$1._close();
          }
          facade$$1 = null;
          break;
        }
      };

      event.attachEvent('message', onMessage);

      // Start
      iframe.postMessage('s');
    };
  };

  var debug$k = function() {};
  if (process.env.NODE_ENV !== 'production') {
    debug$k = browser$1('sockjs-client:main');
  }

  var transports;

  // follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface
  function SockJS(url$$1, protocols, options) {
    if (!(this instanceof SockJS)) {
      return new SockJS(url$$1, protocols, options);
    }
    if (arguments.length < 1) {
      throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
    }
    eventtarget.call(this);

    this.readyState = SockJS.CONNECTING;
    this.extensions = '';
    this.protocol = '';

    // non-standard extension
    options = options || {};
    if (options.protocols_whitelist) {
      log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
    }
    this._transportsWhitelist = options.transports;
    this._transportOptions = options.transportOptions || {};

    var sessionId = options.sessionId || 8;
    if (typeof sessionId === 'function') {
      this._generateSessionId = sessionId;
    } else if (typeof sessionId === 'number') {
      this._generateSessionId = function() {
        return random.string(sessionId);
      };
    } else {
      throw new TypeError('If sessionId is used in the options, it needs to be a number or a function.');
    }

    this._server = options.server || random.numberString(1000);

    // Step 1 of WS spec - parse and validate the url. Issue #8
    var parsedUrl = new urlParse(url$$1);
    if (!parsedUrl.host || !parsedUrl.protocol) {
      throw new SyntaxError("The URL '" + url$$1 + "' is invalid");
    } else if (parsedUrl.hash) {
      throw new SyntaxError('The URL must not contain a fragment');
    } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
    }

    var secure = parsedUrl.protocol === 'https:';
    // Step 2 - don't allow secure origin with an insecure protocol
    if (location.protocol === 'https:' && !secure) {
      throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
    }

    // Step 3 - check port access - no need here
    // Step 4 - parse protocols argument
    if (!protocols) {
      protocols = [];
    } else if (!Array.isArray(protocols)) {
      protocols = [protocols];
    }

    // Step 5 - check protocols argument
    var sortedProtocols = protocols.sort();
    sortedProtocols.forEach(function(proto, i) {
      if (!proto) {
        throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
      }
      if (i < (sortedProtocols.length - 1) && proto === sortedProtocols[i + 1]) {
        throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
      }
    });

    // Step 6 - convert origin
    var o = url.getOrigin(location.href);
    this._origin = o ? o.toLowerCase() : null;

    // remove the trailing slash
    parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, ''));

    // store the sanitized url
    this.url = parsedUrl.href;
    debug$k('using url', this.url);

    // Step 7 - start connection in background
    // obtain server info
    // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26
    this._urlInfo = {
      nullOrigin: !browser$2.hasDomain()
    , sameOrigin: url.isOriginEqual(this.url, location.href)
    , sameScheme: url.isSchemeEqual(this.url, location.href)
    };

    this._ir = new infoReceiver(this.url, this._urlInfo);
    this._ir.once('finish', this._receiveInfo.bind(this));
  }

  inherits_browser(SockJS, eventtarget);

  function userSetCode(code) {
    return code === 1000 || (code >= 3000 && code <= 4999);
  }

  SockJS.prototype.close = function(code, reason) {
    // Step 1
    if (code && !userSetCode(code)) {
      throw new Error('InvalidAccessError: Invalid code');
    }
    // Step 2.4 states the max is 123 bytes, but we are just checking length
    if (reason && reason.length > 123) {
      throw new SyntaxError('reason argument has an invalid length');
    }

    // Step 3.1
    if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
      return;
    }

    // TODO look at docs to determine how to set this
    var wasClean = true;
    this._close(code || 1000, reason || 'Normal closure', wasClean);
  };

  SockJS.prototype.send = function(data) {
    // #13 - convert anything non-string to string
    // TODO this currently turns objects into [object Object]
    if (typeof data !== 'string') {
      data = '' + data;
    }
    if (this.readyState === SockJS.CONNECTING) {
      throw new Error('InvalidStateError: The connection has not been established yet');
    }
    if (this.readyState !== SockJS.OPEN) {
      return;
    }
    this._transport.send(_escape.quote(data));
  };

  SockJS.version = version$1;

  SockJS.CONNECTING = 0;
  SockJS.OPEN = 1;
  SockJS.CLOSING = 2;
  SockJS.CLOSED = 3;

  SockJS.prototype._receiveInfo = function(info, rtt) {
    debug$k('_receiveInfo', rtt);
    this._ir = null;
    if (!info) {
      this._close(1002, 'Cannot connect to server');
      return;
    }

    // establish a round-trip timeout (RTO) based on the
    // round-trip time (RTT)
    this._rto = this.countRTO(rtt);
    // allow server to override url used for the actual transport
    this._transUrl = info.base_url ? info.base_url : this.url;
    info = object.extend(info, this._urlInfo);
    debug$k('info', info);
    // determine list of desired and supported transports
    var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
    this._transports = enabledTransports.main;
    debug$k(this._transports.length + ' enabled transports');

    this._connect();
  };

  SockJS.prototype._connect = function() {
    for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
      debug$k('attempt', Transport.transportName);
      if (Transport.needBody) {
        if (!commonjsGlobal.document.body ||
            (typeof commonjsGlobal.document.readyState !== 'undefined' &&
              commonjsGlobal.document.readyState !== 'complete' &&
              commonjsGlobal.document.readyState !== 'interactive')) {
          debug$k('waiting for body');
          this._transports.unshift(Transport);
          event.attachEvent('load', this._connect.bind(this));
          return;
        }
      }

      // calculate timeout based on RTO and round trips. Default to 5s
      var timeoutMs = (this._rto * Transport.roundTrips) || 5000;
      this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
      debug$k('using timeout', timeoutMs);

      var transportUrl = url.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
      var options = this._transportOptions[Transport.transportName];
      debug$k('transport url', transportUrl);
      var transportObj = new Transport(transportUrl, this._transUrl, options);
      transportObj.on('message', this._transportMessage.bind(this));
      transportObj.once('close', this._transportClose.bind(this));
      transportObj.transportName = Transport.transportName;
      this._transport = transportObj;

      return;
    }
    this._close(2000, 'All transports failed', false);
  };

  SockJS.prototype._transportTimeout = function() {
    debug$k('_transportTimeout');
    if (this.readyState === SockJS.CONNECTING) {
      if (this._transport) {
        this._transport.close();
      }

      this._transportClose(2007, 'Transport timed out');
    }
  };

  SockJS.prototype._transportMessage = function(msg) {
    debug$k('_transportMessage', msg);
    var self = this
      , type = msg.slice(0, 1)
      , content = msg.slice(1)
      , payload
      ;

    // first check for messages that don't need a payload
    switch (type) {
      case 'o':
        this._open();
        return;
      case 'h':
        this.dispatchEvent(new event$1('heartbeat'));
        debug$k('heartbeat', this.transport);
        return;
    }

    if (content) {
      try {
        payload = json3.parse(content);
      } catch (e) {
        debug$k('bad json', content);
      }
    }

    if (typeof payload === 'undefined') {
      debug$k('empty payload', content);
      return;
    }

    switch (type) {
      case 'a':
        if (Array.isArray(payload)) {
          payload.forEach(function(p) {
            debug$k('message', self.transport, p);
            self.dispatchEvent(new transMessage(p));
          });
        }
        break;
      case 'm':
        debug$k('message', this.transport, payload);
        this.dispatchEvent(new transMessage(payload));
        break;
      case 'c':
        if (Array.isArray(payload) && payload.length === 2) {
          this._close(payload[0], payload[1], true);
        }
        break;
    }
  };

  SockJS.prototype._transportClose = function(code, reason) {
    debug$k('_transportClose', this.transport, code, reason);
    if (this._transport) {
      this._transport.removeAllListeners();
      this._transport = null;
      this.transport = null;
    }

    if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
      this._connect();
      return;
    }

    this._close(code, reason);
  };

  SockJS.prototype._open = function() {
    debug$k('_open', this._transport.transportName, this.readyState);
    if (this.readyState === SockJS.CONNECTING) {
      if (this._transportTimeoutId) {
        clearTimeout(this._transportTimeoutId);
        this._transportTimeoutId = null;
      }
      this.readyState = SockJS.OPEN;
      this.transport = this._transport.transportName;
      this.dispatchEvent(new event$1('open'));
      debug$k('connected', this.transport);
    } else {
      // The server might have been restarted, and lost track of our
      // connection.
      this._close(1006, 'Server lost session');
    }
  };

  SockJS.prototype._close = function(code, reason, wasClean) {
    debug$k('_close', this.transport, code, reason, wasClean, this.readyState);
    var forceFail = false;

    if (this._ir) {
      forceFail = true;
      this._ir.close();
      this._ir = null;
    }
    if (this._transport) {
      this._transport.close();
      this._transport = null;
      this.transport = null;
    }

    if (this.readyState === SockJS.CLOSED) {
      throw new Error('InvalidStateError: SockJS has already been closed');
    }

    this.readyState = SockJS.CLOSING;
    setTimeout(function() {
      this.readyState = SockJS.CLOSED;

      if (forceFail) {
        this.dispatchEvent(new event$1('error'));
      }

      var e = new close('close');
      e.wasClean = wasClean || false;
      e.code = code || 1000;
      e.reason = reason;

      this.dispatchEvent(e);
      this.onmessage = this.onclose = this.onerror = null;
      debug$k('disconnected');
    }.bind(this), 0);
  };

  // See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
  // and RFC 2988.
  SockJS.prototype.countRTO = function(rtt) {
    // In a local environment, when using IE8/9 and the `jsonp-polling`
    // transport the time needed to establish a connection (the time that pass
    // from the opening of the transport to the call of `_dispatchOpen`) is
    // around 200msec (the lower bound used in the article above) and this
    // causes spurious timeouts. For this reason we calculate a value slightly
    // larger than that used in the article.
    if (rtt > 100) {
      return 4 * rtt; // rto > 400msec
    }
    return 300 + rtt; // 300msec < rto <= 400msec
  };

  var main = function(availableTransports) {
    transports = transport(availableTransports);
    iframeBootstrap(SockJS, availableTransports);
    return SockJS;
  };

  var entry = main(transportList);

  // TODO can't get rid of this until all servers do
  if ('_sockjs_onload' in commonjsGlobal) {
    setTimeout(commonjsGlobal._sockjs_onload, 1);
  }

  var stomp = createCommonjsModule$1(function (module, exports) {
  // Generated by CoffeeScript 1.12.6

  /*
     Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

     Copyright (C) 2010-2013 [Jeff Mesnil](http://jmesnil.net/)
     Copyright (C) 2012 [FuseSource, Inc.](http://fusesource.com)
     Copyright (C) 2017 [Deepak Kumar](https://www.kreatio.com)
   */

  (function() {
    var Byte, Client, Frame, Stomp,
      hasProp = {}.hasOwnProperty,
      slice = [].slice;

    Byte = {
      LF: '\x0A',
      NULL: '\x00'
    };

    Frame = (function() {
      var unmarshallSingle;

      function Frame(command1, headers1, body1, escapeHeaderValues1) {
        this.command = command1;
        this.headers = headers1 != null ? headers1 : {};
        this.body = body1 != null ? body1 : '';
        this.escapeHeaderValues = escapeHeaderValues1 != null ? escapeHeaderValues1 : false;
      }

      Frame.prototype.toString = function() {
        var lines, name, ref, skipContentLength, value;
        lines = [this.command];
        skipContentLength = (this.headers['content-length'] === false) ? true : false;
        if (skipContentLength) {
          delete this.headers['content-length'];
        }
        ref = this.headers;
        for (name in ref) {
          if (!hasProp.call(ref, name)) continue;
          value = ref[name];
          if (this.escapeHeaderValues && this.command !== 'CONNECT' && this.command !== 'CONNECTED') {
            lines.push(name + ":" + (Frame.frEscape(value)));
          } else {
            lines.push(name + ":" + value);
          }
        }
        if (this.body && !skipContentLength) {
          lines.push("content-length:" + (Frame.sizeOfUTF8(this.body)));
        }
        lines.push(Byte.LF + this.body);
        return lines.join(Byte.LF);
      };

      Frame.sizeOfUTF8 = function(s) {
        if (s) {
          return encodeURI(s).match(/%..|./g).length;
        } else {
          return 0;
        }
      };

      unmarshallSingle = function(data, escapeHeaderValues) {
        var body, chr, command, divider, headerLines, headers, i, idx, j, k, len, len1, line, ref, ref1, ref2, start, trim;
        if (escapeHeaderValues == null) {
          escapeHeaderValues = false;
        }
        divider = data.search(RegExp("" + Byte.LF + Byte.LF));
        headerLines = data.substring(0, divider).split(Byte.LF);
        command = headerLines.shift();
        headers = {};
        trim = function(str) {
          return str.replace(/^\s+|\s+$/g, '');
        };
        ref = headerLines.reverse();
        for (j = 0, len1 = ref.length; j < len1; j++) {
          line = ref[j];
          idx = line.indexOf(':');
          if (escapeHeaderValues && command !== 'CONNECT' && command !== 'CONNECTED') {
            headers[trim(line.substring(0, idx))] = Frame.frUnEscape(trim(line.substring(idx + 1)));
          } else {
            headers[trim(line.substring(0, idx))] = trim(line.substring(idx + 1));
          }
        }
        body = '';
        start = divider + 2;
        if (headers['content-length']) {
          len = parseInt(headers['content-length']);
          body = ('' + data).substring(start, start + len);
        } else {
          chr = null;
          for (i = k = ref1 = start, ref2 = data.length; ref1 <= ref2 ? k < ref2 : k > ref2; i = ref1 <= ref2 ? ++k : --k) {
            chr = data.charAt(i);
            if (chr === Byte.NULL) {
              break;
            }
            body += chr;
          }
        }
        return new Frame(command, headers, body, escapeHeaderValues);
      };

      Frame.unmarshall = function(datas, escapeHeaderValues) {
        var frame, frames, last_frame, r;
        if (escapeHeaderValues == null) {
          escapeHeaderValues = false;
        }
        frames = datas.split(RegExp("" + Byte.NULL + Byte.LF + "*"));
        r = {
          frames: [],
          partial: ''
        };
        r.frames = (function() {
          var j, len1, ref, results;
          ref = frames.slice(0, -1);
          results = [];
          for (j = 0, len1 = ref.length; j < len1; j++) {
            frame = ref[j];
            results.push(unmarshallSingle(frame, escapeHeaderValues));
          }
          return results;
        })();
        last_frame = frames.slice(-1)[0];
        if (last_frame === Byte.LF || (last_frame.search(RegExp("" + Byte.NULL + Byte.LF + "*$"))) !== -1) {
          r.frames.push(unmarshallSingle(last_frame, escapeHeaderValues));
        } else {
          r.partial = last_frame;
        }
        return r;
      };

      Frame.marshall = function(command, headers, body, escapeHeaderValues) {
        var frame;
        frame = new Frame(command, headers, body, escapeHeaderValues);
        return frame.toString() + Byte.NULL;
      };

      Frame.frEscape = function(str) {
        return ("" + str).replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c");
      };

      Frame.frUnEscape = function(str) {
        return ("" + str).replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\");
      };

      return Frame;

    })();

    Client = (function() {
      var now;

      function Client(ws_fn) {
        this.ws_fn = function() {
          var ws;
          ws = ws_fn();
          ws.binaryType = "arraybuffer";
          return ws;
        };
        this.reconnect_delay = 0;
        this.counter = 0;
        this.connected = false;
        this.heartbeat = {
          outgoing: 10000,
          incoming: 10000
        };
        this.maxWebSocketFrameSize = 16 * 1024;
        this.subscriptions = {};
        this.partialData = '';
      }

      Client.prototype.debug = function(message) {
        var ref;
        return typeof window !== "undefined" && window !== null ? (ref = window.console) != null ? ref.log(message) : void 0 : void 0;
      };

      now = function() {
        if (Date.now) {
          return Date.now();
        } else {
          return new Date().valueOf;
        }
      };

      Client.prototype._transmit = function(command, headers, body) {
        var out;
        out = Frame.marshall(command, headers, body, this.escapeHeaderValues);
        if (typeof this.debug === "function") {
          this.debug(">>> " + out);
        }
        while (true) {
          if (out.length > this.maxWebSocketFrameSize) {
            this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
            out = out.substring(this.maxWebSocketFrameSize);
            if (typeof this.debug === "function") {
              this.debug("remaining = " + out.length);
            }
          } else {
            return this.ws.send(out);
          }
        }
      };

      Client.prototype._setupHeartbeat = function(headers) {
        var ref, ref1, serverIncoming, serverOutgoing, ttl, v;
        if ((ref = headers.version) !== Stomp.VERSIONS.V1_1 && ref !== Stomp.VERSIONS.V1_2) {
          return;
        }
        ref1 = (function() {
          var j, len1, ref1, results;
          ref1 = headers['heart-beat'].split(",");
          results = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            v = ref1[j];
            results.push(parseInt(v));
          }
          return results;
        })(), serverOutgoing = ref1[0], serverIncoming = ref1[1];
        if (!(this.heartbeat.outgoing === 0 || serverIncoming === 0)) {
          ttl = Math.max(this.heartbeat.outgoing, serverIncoming);
          if (typeof this.debug === "function") {
            this.debug("send PING every " + ttl + "ms");
          }
          this.pinger = Stomp.setInterval(ttl, (function(_this) {
            return function() {
              _this.ws.send(Byte.LF);
              return typeof _this.debug === "function" ? _this.debug(">>> PING") : void 0;
            };
          })(this));
        }
        if (!(this.heartbeat.incoming === 0 || serverOutgoing === 0)) {
          ttl = Math.max(this.heartbeat.incoming, serverOutgoing);
          if (typeof this.debug === "function") {
            this.debug("check PONG every " + ttl + "ms");
          }
          return this.ponger = Stomp.setInterval(ttl, (function(_this) {
            return function() {
              var delta;
              delta = now() - _this.serverActivity;
              if (delta > ttl * 2) {
                if (typeof _this.debug === "function") {
                  _this.debug("did not receive server activity for the last " + delta + "ms");
                }
                return _this.ws.close();
              }
            };
          })(this));
        }
      };

      Client.prototype._parseConnect = function() {
        var args, closeEventCallback, connectCallback, errorCallback, headers;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        headers = {};
        if (args.length < 2) {
          throw "Connect requires at least 2 arguments";
        }
        if (typeof args[1] === 'function') {
          headers = args[0], connectCallback = args[1], errorCallback = args[2], closeEventCallback = args[3];
        } else {
          switch (args.length) {
            case 6:
              headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3], closeEventCallback = args[4], headers.host = args[5];
              break;
            default:
              headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3], closeEventCallback = args[4];
          }
        }
        return [headers, connectCallback, errorCallback, closeEventCallback];
      };

      Client.prototype.connect = function() {
        var args, out;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        this.escapeHeaderValues = false;
        out = this._parseConnect.apply(this, args);
        this.headers = out[0], this.connectCallback = out[1], this.errorCallback = out[2], this.closeEventCallback = out[3];
        this._active = true;
        return this._connect();
      };

      Client.prototype._connect = function() {
        var closeEventCallback, errorCallback, headers;
        headers = this.headers;
        errorCallback = this.errorCallback;
        closeEventCallback = this.closeEventCallback;
        if (!this._active) {
          this.debug('Client has been marked inactive, will not attempt to connect');
          return;
        }
        if (typeof this.debug === "function") {
          this.debug("Opening Web Socket...");
        }
        this.ws = this.ws_fn();
        this.ws.onmessage = (function(_this) {
          return function(evt) {
            var arr, c, client, data, frame, j, len1, messageID, onreceive, ref, subscription, unmarshalledData;
            data = typeof ArrayBuffer !== 'undefined' && evt.data instanceof ArrayBuffer ? (arr = new Uint8Array(evt.data), typeof _this.debug === "function" ? _this.debug("--- got data length: " + arr.length) : void 0, ((function() {
              var j, len1, results;
              results = [];
              for (j = 0, len1 = arr.length; j < len1; j++) {
                c = arr[j];
                results.push(String.fromCharCode(c));
              }
              return results;
            })()).join('')) : evt.data;
            _this.serverActivity = now();
            if (data === Byte.LF) {
              if (typeof _this.debug === "function") {
                _this.debug("<<< PONG");
              }
              return;
            }
            if (typeof _this.debug === "function") {
              _this.debug("<<< " + data);
            }
            unmarshalledData = Frame.unmarshall(_this.partialData + data, _this.escapeHeaderValues);
            _this.partialData = unmarshalledData.partial;
            ref = unmarshalledData.frames;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              frame = ref[j];
              switch (frame.command) {
                case "CONNECTED":
                  if (typeof _this.debug === "function") {
                    _this.debug("connected to server " + frame.headers.server);
                  }
                  _this.connected = true;
                  _this.version = frame.headers.version;
                  if (_this.version === Stomp.VERSIONS.V1_2) {
                    _this.escapeHeaderValues = true;
                  }
                  if (!_this._active) {
                    _this.disconnect();
                    return;
                  }
                  _this._setupHeartbeat(frame.headers);
                  if (typeof _this.connectCallback === "function") {
                    _this.connectCallback(frame);
                  }
                  break;
                case "MESSAGE":
                  subscription = frame.headers.subscription;
                  onreceive = _this.subscriptions[subscription] || _this.onreceive;
                  if (onreceive) {
                    client = _this;
                    if (_this.version === Stomp.VERSIONS.V1_2) {
                      messageID = frame.headers["ack"];
                    } else {
                      messageID = frame.headers["message-id"];
                    }
                    frame.ack = function(headers) {
                      if (headers == null) {
                        headers = {};
                      }
                      return client.ack(messageID, subscription, headers);
                    };
                    frame.nack = function(headers) {
                      if (headers == null) {
                        headers = {};
                      }
                      return client.nack(messageID, subscription, headers);
                    };
                    onreceive(frame);
                  } else {
                    if (typeof _this.debug === "function") {
                      _this.debug("Unhandled received MESSAGE: " + frame);
                    }
                  }
                  break;
                case "RECEIPT":
                  if (frame.headers["receipt-id"] === _this.closeReceipt) {
                    _this.ws.onclose = null;
                    _this.ws.close();
                    _this._cleanUp();
                    if (typeof _this._disconnectCallback === "function") {
                      _this._disconnectCallback();
                    }
                  } else {
                    if (typeof _this.onreceipt === "function") {
                      _this.onreceipt(frame);
                    }
                  }
                  break;
                case "ERROR":
                  if (typeof errorCallback === "function") {
                    errorCallback(frame);
                  }
                  break;
                default:
                  if (typeof _this.debug === "function") {
                    _this.debug("Unhandled frame: " + frame);
                  }
              }
            }
          };
        })(this);
        this.ws.onclose = (function(_this) {
          return function(closeEvent) {
            var msg;
            msg = "Whoops! Lost connection to " + _this.ws.url;
            if (typeof _this.debug === "function") {
              _this.debug(msg);
            }
            if (typeof closeEventCallback === "function") {
              closeEventCallback(closeEvent);
            }
            _this._cleanUp();
            if (typeof errorCallback === "function") {
              errorCallback(msg);
            }
            return _this._schedule_reconnect();
          };
        })(this);
        return this.ws.onopen = (function(_this) {
          return function() {
            if (typeof _this.debug === "function") {
              _this.debug('Web Socket Opened...');
            }
            headers["accept-version"] = Stomp.VERSIONS.supportedVersions();
            headers["heart-beat"] = [_this.heartbeat.outgoing, _this.heartbeat.incoming].join(',');
            return _this._transmit("CONNECT", headers);
          };
        })(this);
      };

      Client.prototype._schedule_reconnect = function() {
        if (this.reconnect_delay > 0) {
          if (typeof this.debug === "function") {
            this.debug("STOMP: scheduling reconnection in " + this.reconnect_delay + "ms");
          }
          return this._reconnector = setTimeout((function(_this) {
            return function() {
              if (_this.connected) {
                return typeof _this.debug === "function" ? _this.debug('STOMP: already connected') : void 0;
              } else {
                if (typeof _this.debug === "function") {
                  _this.debug('STOMP: attempting to reconnect');
                }
                return _this._connect();
              }
            };
          })(this), this.reconnect_delay);
        }
      };

      Client.prototype.disconnect = function(disconnectCallback, headers) {
        var error;
        if (headers == null) {
          headers = {};
        }
        this._disconnectCallback = disconnectCallback;
        this._active = false;
        if (this.connected) {
          if (!headers.receipt) {
            headers.receipt = "close-" + this.counter++;
          }
          this.closeReceipt = headers.receipt;
          try {
            return this._transmit("DISCONNECT", headers);
          } catch (error1) {
            error = error1;
            return typeof this.debug === "function" ? this.debug('Ignoring error during disconnect', error) : void 0;
          }
        }
      };

      Client.prototype._cleanUp = function() {
        if (this._reconnector) {
          clearTimeout(this._reconnector);
        }
        this.connected = false;
        this.subscriptions = {};
        this.partial = '';
        if (this.pinger) {
          Stomp.clearInterval(this.pinger);
        }
        if (this.ponger) {
          return Stomp.clearInterval(this.ponger);
        }
      };

      Client.prototype.send = function(destination, headers, body) {
        if (headers == null) {
          headers = {};
        }
        if (body == null) {
          body = '';
        }
        headers.destination = destination;
        return this._transmit("SEND", headers, body);
      };

      Client.prototype.subscribe = function(destination, callback, headers) {
        var client;
        if (headers == null) {
          headers = {};
        }
        if (!headers.id) {
          headers.id = "sub-" + this.counter++;
        }
        headers.destination = destination;
        this.subscriptions[headers.id] = callback;
        this._transmit("SUBSCRIBE", headers);
        client = this;
        return {
          id: headers.id,
          unsubscribe: function(hdrs) {
            return client.unsubscribe(headers.id, hdrs);
          }
        };
      };

      Client.prototype.unsubscribe = function(id, headers) {
        if (headers == null) {
          headers = {};
        }
        delete this.subscriptions[id];
        headers.id = id;
        return this._transmit("UNSUBSCRIBE", headers);
      };

      Client.prototype.begin = function(transaction_id) {
        var client, txid;
        txid = transaction_id || "tx-" + this.counter++;
        this._transmit("BEGIN", {
          transaction: txid
        });
        client = this;
        return {
          id: txid,
          commit: function() {
            return client.commit(txid);
          },
          abort: function() {
            return client.abort(txid);
          }
        };
      };

      Client.prototype.commit = function(transaction_id) {
        return this._transmit("COMMIT", {
          transaction: transaction_id
        });
      };

      Client.prototype.abort = function(transaction_id) {
        return this._transmit("ABORT", {
          transaction: transaction_id
        });
      };

      Client.prototype.ack = function(messageID, subscription, headers) {
        if (headers == null) {
          headers = {};
        }
        if (this.version === Stomp.VERSIONS.V1_2) {
          headers["id"] = messageID;
        } else {
          headers["message-id"] = messageID;
        }
        headers.subscription = subscription;
        return this._transmit("ACK", headers);
      };

      Client.prototype.nack = function(messageID, subscription, headers) {
        if (headers == null) {
          headers = {};
        }
        if (this.version === Stomp.VERSIONS.V1_2) {
          headers["id"] = messageID;
        } else {
          headers["message-id"] = messageID;
        }
        headers.subscription = subscription;
        return this._transmit("NACK", headers);
      };

      return Client;

    })();

    Stomp = {
      VERSIONS: {
        V1_0: '1.0',
        V1_1: '1.1',
        V1_2: '1.2',
        supportedVersions: function() {
          return '1.2,1.1,1.0';
        }
      },
      client: function(url, protocols) {
        var ws_fn;
        if (protocols == null) {
          protocols = ['v10.stomp', 'v11.stomp', 'v12.stomp'];
        }
        ws_fn = function() {
          var klass;
          klass = Stomp.WebSocketClass || WebSocket;
          return new klass(url, protocols);
        };
        return new Client(ws_fn);
      },
      over: function(ws) {
        var ws_fn;
        ws_fn = typeof ws === "function" ? ws : function() {
          return ws;
        };
        return new Client(ws_fn);
      },
      Frame: Frame
    };

    Stomp.setInterval = function(interval, f) {
      return setInterval(f, interval);
    };

    Stomp.clearInterval = function(id) {
      return clearInterval(id);
    };

    if (exports !== null) {
      exports.Stomp = Stomp;
    }

    if (typeof window !== "undefined" && window !== null) {
      window.Stomp = Stomp;
    } else if (!exports) {
      self.Stomp = Stomp;
    }

  }).call(commonjsGlobal);
  });
  var stomp_1 = stomp.Stomp;

  // Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
  //
  //   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0
  //
  // The library can be used in node.js app to connect to STOMP brokers over TCP 
  // or Web sockets.

  // Root of the `stompjs module`


  var stompjs = stomp.Stomp;

  var over = stomp.Stomp.over;
  var client = stomp.Stomp.client;

  if (typeof WebSocket !== 'function') {
    stomp.Stomp.WebSocketClass = websocket.w3cwebsocket;
  }
  stompjs.over = over;
  stompjs.client = client;

  var WebSocketPipelineDriver = /** @class */ (function () {
      function WebSocketPipelineDriver() {
          this.activeSocket = undefined;
          this.pipelineSink = undefined;
          this.connectionTime = 0;
      }
      WebSocketPipelineDriver.prototype.endpointRegistered = function (pipelineSink, userDeliveryEndpoint) {
          // Do nothing. For a driver not handling endpoints, this method will never be called
          console.warn('Assertion error. This should never be called');
      };
      WebSocketPipelineDriver.prototype.getDeliveryEndpoint = function () {
          return Promise.resolve(undefined);
      };
      WebSocketPipelineDriver.prototype.halt = function () { };
      WebSocketPipelineDriver.prototype.initialize = function (mitter) {
          var _this = this;
          var sockJs = new entry(mitter.mitterApiBaseUrl + "/v1/socket/control/sockjs");
          this.activeSocket = over(sockJs);
          this.activeSocket.debug = function () { };
          return {
              pipelineDriverSpec: {
                  name: 'mitter-ws-driver'
              },
              initialized: new Promise(function (resolve, reject) {
                  mitter.getUserAuthorization().then(function (userAuthorization) {
                      var _a;
                      if (userAuthorization === undefined || _this.activeSocket === undefined) {
                          reject(Error('Cannot construct websocket without user authorization'));
                      }
                      else {
                          var authHeaders = (_a = {},
                              _a[StandardHeaders.UserAuthorizationHeader] = userAuthorization,
                              _a);
                          if (mitter.applicationId !== undefined) {
                              authHeaders[StandardHeaders.ApplicationIdHeader] = mitter.applicationId;
                          }
                          _this.activeSocket.reconnect_delay = 1000;
                          _this.activeSocket.connect(authHeaders, function (frame) {
                              _this.activeSocket.subscribe('/user/event-stream', _this.processMessage.bind(_this));
                              resolve(true);
                          }, function (error) {
                              reject(error);
                          });
                      }
                  });
              })
          };
      };
      WebSocketPipelineDriver.prototype.pipelineSinkChanged = function (pipelineSink) {
          this.pipelineSink = pipelineSink;
      };
      WebSocketPipelineDriver.prototype.processMessage = function (wsMessage) {
          if (this.pipelineSink !== undefined) {
              this.pipelineSink.received(JSON.parse(wsMessage.body));
          }
      };
      return WebSocketPipelineDriver;
  }());

  var Mitter$1 = {
      forWeb: function (applicationId, onTokenExpire, mitterApiBaseUrl, mitterInstanceReady) {
          if (applicationId === void 0) { applicationId = undefined; }
          if (onTokenExpire === void 0) { onTokenExpire = []; }
          if (mitterApiBaseUrl === void 0) { mitterApiBaseUrl = MitterConstants.MitterApiUrl; }
          if (mitterInstanceReady === void 0) { mitterInstanceReady = function () { }; }
          return new Mitter(new KvStore(), applicationId, mitterApiBaseUrl, onTokenExpire, mitterInstanceReady, new WebSocketPipelineDriver(), window);
      }
  };

  exports.WebKvStore = KvStore;
  exports.Mitter = Mitter$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"websocket":31}],5:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":7}],6:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))
},{"../core/createError":13,"./../core/settle":16,"./../helpers/btoa":20,"./../helpers/buildURL":21,"./../helpers/cookies":23,"./../helpers/isURLSameOrigin":25,"./../helpers/parseHeaders":27,"./../utils":29,"_process":1}],7:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":8,"./cancel/CancelToken":9,"./cancel/isCancel":10,"./core/Axios":11,"./defaults":18,"./helpers/bind":19,"./helpers/spread":28,"./utils":29}],8:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],9:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":8}],10:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],11:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":18,"./../utils":29,"./InterceptorManager":12,"./dispatchRequest":14}],12:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":29}],13:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":15}],14:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":10,"../defaults":18,"./../helpers/combineURLs":22,"./../helpers/isAbsoluteURL":24,"./../utils":29,"./transformData":17}],15:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],16:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":13}],17:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":29}],18:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))
},{"./adapters/http":6,"./adapters/xhr":6,"./helpers/normalizeHeaderName":26,"./utils":29,"_process":1}],19:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],20:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],21:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":29}],22:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":29}],24:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":29}],26:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":29}],27:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":29}],28:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],29:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":19,"is-buffer":30}],30:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],31:[function(require,module,exports){
var _global = (function() { return this; })();
var NativeWebSocket = _global.WebSocket || _global.MozWebSocket;
var websocket_version = require('./version');


/**
 * Expose a W3C WebSocket class with just one or two arguments.
 */
function W3CWebSocket(uri, protocols) {
	var native_instance;

	if (protocols) {
		native_instance = new NativeWebSocket(uri, protocols);
	}
	else {
		native_instance = new NativeWebSocket(uri);
	}

	/**
	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
	 * class). Since it is an Object it will be returned as it is when creating an
	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
	 *
	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
	 */
	return native_instance;
}
if (NativeWebSocket) {
	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
		Object.defineProperty(W3CWebSocket, prop, {
			get: function() { return NativeWebSocket[prop]; }
		});
	});
}

/**
 * Module exports.
 */
module.exports = {
    'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
    'version'      : websocket_version
};

},{"./version":32}],32:[function(require,module,exports){
module.exports = require('../package.json').version;

},{"../package.json":33}],33:[function(require,module,exports){
module.exports={
  "_from": "websocket@^1.0.24",
  "_id": "websocket@1.0.28",
  "_inBundle": false,
  "_integrity": "sha512-00y/20/80P7H4bCYkzuuvvfDvh+dgtXi5kzDf3UcZwN6boTYaKvsrtZ5lIYm1Gsg48siMErd9M4zjSYfYFHTrA==",
  "_location": "/websocket",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "websocket@^1.0.24",
    "name": "websocket",
    "escapedName": "websocket",
    "rawSpec": "^1.0.24",
    "saveSpec": null,
    "fetchSpec": "^1.0.24"
  },
  "_requiredBy": [
    "/@stomp/stompjs"
  ],
  "_resolved": "https://registry.npmjs.org/websocket/-/websocket-1.0.28.tgz",
  "_shasum": "9e5f6fdc8a3fe01d4422647ef93abdd8d45a78d3",
  "_spec": "websocket@^1.0.24",
  "_where": "/home/username/BACKUP/mitter/node_modules/@stomp/stompjs",
  "author": {
    "name": "Brian McKelvey",
    "email": "theturtle32@gmail.com",
    "url": "https://github.com/theturtle32"
  },
  "browser": "lib/browser.js",
  "bugs": {
    "url": "https://github.com/theturtle32/WebSocket-Node/issues"
  },
  "bundleDependencies": false,
  "config": {
    "verbose": false
  },
  "contributors": [
    {
      "name": "Iñaki Baz Castillo",
      "email": "ibc@aliax.net",
      "url": "http://dev.sipdoc.net"
    }
  ],
  "dependencies": {
    "debug": "^2.2.0",
    "nan": "^2.11.0",
    "typedarray-to-buffer": "^3.1.5",
    "yaeti": "^0.0.6"
  },
  "deprecated": false,
  "description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
  "devDependencies": {
    "buffer-equal": "^1.0.0",
    "faucet": "^0.0.1",
    "gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
    "gulp-jshint": "^2.0.4",
    "jshint": "^2.0.0",
    "jshint-stylish": "^2.2.1",
    "tape": "^4.9.1"
  },
  "directories": {
    "lib": "./lib"
  },
  "engines": {
    "node": ">=0.10.0"
  },
  "homepage": "https://github.com/theturtle32/WebSocket-Node",
  "keywords": [
    "websocket",
    "websockets",
    "socket",
    "networking",
    "comet",
    "push",
    "RFC-6455",
    "realtime",
    "server",
    "client"
  ],
  "license": "Apache-2.0",
  "main": "index",
  "name": "websocket",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/theturtle32/WebSocket-Node.git"
  },
  "scripts": {
    "gulp": "gulp",
    "install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
    "test": "faucet test/unit"
  },
  "version": "1.0.28"
}

},{}]},{},[2]);
