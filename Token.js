'use strict';
exports.__esModule = true;
var LocalToken_1 = require("./LocalToken");
var emiya_js_utils_1 = require("emiya-js-utils");
var emiya_angular2_event_1 = require("emiya-angular2-event");
var SessionToken_1 = require("./SessionToken");
//const constants = {tokenStorageMethod: 'local'};
var Token = (function () {
    function Token() {
    }
    Token.getDefaultLocation = function () {
        return this._defaultLocation;
    };
    Token.setDefaultLocation = function (value) {
        this._defaultLocation = value;
    };
    Token.set = function (key, token, method, expiry_time, can_refresh, disabled) {
        if (method === void 0) { method = null; }
        if (expiry_time === void 0) { expiry_time = null; }
        if (can_refresh === void 0) { can_refresh = null; }
        if (disabled === void 0) { disabled = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            Token.localToken.set(key, token, expiry_time, can_refresh, disabled);
        else
            Token.sessionToken.set(key, token, expiry_time, can_refresh, disabled);
    };
    Token.updateTimestamp = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            Token.localToken.updateTimestamp(key);
        else
            Token.sessionToken.updateTimestamp(key);
    };
    Token.get = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            return Token.localToken.get(key);
        else
            return Token.sessionToken.get(key);
    };
    Token.has = function (key, method) {
        if (method === void 0) { method = null; }
        if (key instanceof Array)
            return Token.hasAll(key, method);
        else {
            if (!method)
                method = Token._defaultLocation;
            return method === 'local' ? Token.localToken.has(key) : Token.sessionToken.has(key);
        }
    };
    Token["delete"] = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            Token.localToken["delete"](key);
        else
            Token.sessionToken["delete"](key);
    };
    Token.clear = function (method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            Token.localToken.clear();
        else
            Token.sessionToken.clear();
        //delete window.sessionStorage['TokenMaps'];
    };
    Token.clearAll = function () {
        Token.localToken.clear();
        Token.sessionToken.clear();
    };
    Token.getObj = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            return Token.localToken.getObj(key);
        else
            return Token.sessionToken.getObj(key);
    };
    Token.enable = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            return Token.localToken.enable(key);
        else
            return Token.sessionToken.enable(key);
    };
    Token.disable = function (key, method) {
        if (method === void 0) { method = null; }
        if (!method)
            method = Token._defaultLocation;
        if (method === 'local')
            return Token.localToken.disable(key);
        else
            return Token.sessionToken.disable(key);
    };
    Token.hasAll = function (key, location) {
        if (location === void 0) { location = null; }
        for (var c in key) {
            if (Token.has(key[c], (location instanceof Array) && parseInt(c) < location.length ? location[c] : Token._defaultLocation) == false) {
                return false;
            }
        }
        return true;
    };
    Token.subscribe = function (tokens, method, onPass, onDeny, reverse) {
        if (method === void 0) { method = null; }
        if (onPass === void 0) { onPass = null; }
        if (onDeny === void 0) { onDeny = null; }
        if (reverse === void 0) { reverse = false; }
        if (!onDeny && !onPass)
            return;
        if (!(tokens instanceof Array))
            tokens = [tokens];
        if (!(method instanceof Array)) {
            var _method = method ? method : Token._defaultLocation;
            method = [];
            for (var c in tokens)
                method.push(_method);
        }
        var status = [];
        for (var c in tokens) {
            var d = { key: tokens[c], method: null, invalid: null };
            if (method && c < method.length)
                d.method = method[c];
            else
                d.method = Token._defaultLocation;
            status.push(d);
        }
        var lastStatus = Token.has(tokens, method);
        for (var c in status) {
            status[c].invalid = lastStatus;
        }
        if (reverse == true) {
            var _exchange = onDeny;
            onDeny = onPass;
            onPass = _exchange;
        }
        if (lastStatus == true) {
            if (onPass)
                onPass(Token.utils.deepCopy(status));
        }
        else {
            if (onDeny)
                onDeny(Token.utils.deepCopy(status));
        }
        var removeL, addL, clearL;
        if (onPass)
            addL = Token.event.subscribe('tokenChanged:add', function (ev, data) {
                for (var c in status) {
                    if (status[c].method == data.location && status[c].key == data["new"].key) {
                        status[c].invalid = true;
                        break;
                    }
                }
                var all = true;
                for (var c in status) {
                    if (status[c].invalid == false) {
                        all = false;
                        break;
                    }
                }
                //console.log(all, status)
                if (lastStatus != true && all == true) {
                    lastStatus = false;
                    onPass(Token.utils.deepCopy(status));
                }
            });
        if (onDeny)
            removeL = Token.event.subscribe('tokenChanged:delete', function (ev, data) {
                for (var c in status) {
                    if (status[c].method == data.location && status[c].key == data.target.key) {
                        status[c].invalid = false;
                        break;
                    }
                }
                var all = true;
                for (var c in status) {
                    if (status[c].invalid == false) {
                        all = false;
                        break;
                    }
                }
                if (lastStatus != false && all == false) {
                    lastStatus = false;
                    onDeny(Token.utils.deepCopy(status));
                }
            });
        if (onDeny)
            clearL = Token.event.subscribe('tokenChanged:clear', function (ev, data) {
                for (var c in status) {
                    if (status[c].method == data.location)
                        status[c].invalid = false;
                }
                var all = true;
                for (var c in status) {
                    if (status[c].invalid == false) {
                        all = false;
                        break;
                    }
                }
                if (lastStatus != false && all == false) {
                    lastStatus = false;
                    onDeny(Token.utils.deepCopy(status));
                }
            });
        return {
            unsubscribe: function () {
                if (addL)
                    addL.unsubscribe();
                if (removeL)
                    removeL.unsubscribe();
                if (clearL)
                    clearL.unsubscribe();
            }
        };
    };
    return Token;
}());
Token.localToken = LocalToken_1.LocalToken;
Token.sessionToken = SessionToken_1.SessionToken;
Token.event = emiya_angular2_event_1.Event;
Token.utils = emiya_js_utils_1.Utils;
Token._defaultLocation = 'local';
exports.Token = Token;
//# sourceMappingURL=Token.js.map