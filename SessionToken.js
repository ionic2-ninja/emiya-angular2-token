'use strict';
var emiya_js_utils_1 = require("emiya-js-utils");
var emiya_angular2_event_1 = require("emiya-angular2-event");
var SessionToken = (function () {
    function SessionToken() {
    }
    SessionToken.getObj = function (key) {
        if (!key) {
            if (typeof window.sessionStorage['TokenMaps'] === 'undefined')
                return [];
            else {
                var result = [];
                window.sessionStorage['TokenMaps'].split(",").forEach(function (e) {
                    result.push({
                        'key': e.split(':')[0],
                        'token': e.split(':')[1],
                        'timestamp': e.split(':')[2],
                        'expiry_time': e.split(':')[3],
                        'can_refresh': e.split(':')[4],
                        'disabled': e.split(':')[5]
                    });
                });
            }
            return result;
        }
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return {};
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].substr(0, list[i].indexOf(":")) === key) {
                return {
                    'key': list[i].split(':')[0],
                    'token': list[i].split(':')[1],
                    'timestamp': list[i].split(':')[2],
                    'expiry_time': list[i].split(':')[3],
                    'can_refresh': list[i].split(':')[4],
                    'disabled': list[i].split(':')[5]
                };
            }
        }
        return {};
    };
    SessionToken.set = function (key, token, expiry_time, can_refresh, disabled) {
        if (expiry_time === void 0) { expiry_time = null; }
        if (can_refresh === void 0) { can_refresh = null; }
        if (disabled === void 0) { disabled = null; }
        token = token.toString();
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            list = [];
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        var token_expiry_time, can_refresh_flag;
        if (SessionToken.utils.notNull(expiry_time)) {
            token_expiry_time = typeof expiry_time != 'string' ? expiry_time.toString() : expiry_time;
            if (token_expiry_time.indexOf('[') >= 0) {
                token_expiry_time = token_expiry_time.replace('[', '').replace(']', '');
                can_refresh_flag = 0;
            }
            else if (token_expiry_time.indexOf('{') >= 0) {
                token_expiry_time = token_expiry_time.replace('{', '').replace('}', '');
                can_refresh_flag = 1;
            }
            if (SessionToken.utils.notNull(can_refresh))
                can_refresh_flag = can_refresh;
            else if (!SessionToken.utils.notNull(can_refresh_flag))
                can_refresh_flag = 1;
        }
        else {
            token_expiry_time = 86400 * 365;
            if (token.indexOf(':') >= 0) {
                token_expiry_time = token.split(':')[1];
                token = token.split(':')[0];
                if (token_expiry_time.indexOf('[') >= 0) {
                    token_expiry_time = token_expiry_time.replace('[', '').replace(']', '');
                    can_refresh_flag = 0;
                }
                else if (token_expiry_time.indexOf('{') >= 0) {
                    token_expiry_time = token_expiry_time.replace('{', '').replace('}', '');
                    can_refresh_flag = 1;
                }
            }
            if (SessionToken.utils.notNull(can_refresh))
                can_refresh_flag = can_refresh;
            else if (!SessionToken.utils.notNull(can_refresh_flag))
                can_refresh_flag = 1;
        }
        var str, old;
        //console.log(JSON.stringify(window.sessionStorage['TokenMaps']));
        for (var i in list) {
            str = list[i].substr(0, list[i].indexOf(":"));
            old = SessionToken.getObj(key);
            if (str === key /*&& old.disabled == '0' && new Date().getTime() - old.timestamp <= expiry_time*/) {
                str = key + ":" + token + ":" + new Date().getTime() + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0');
                //str = key + ":" + token + ":" + (can_refresh_flag == 1 ? new Date().getTime() : old.timestamp) + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0');
                list[i] = str;
                window.sessionStorage['TokenMaps'] = list.join(',');
                SessionToken.$event.emit('tokenChanged', { action: 'renew', location: 'session', "new": SessionToken.getObj(key), old: old });
                SessionToken.$event.emit('tokenChanged:renew', { location: 'session', "new": SessionToken.getObj(key), old: old });
                return;
            }
        }
        list.push(key + ":" + token + ":" + new Date().getTime() + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0'));
        window.sessionStorage['TokenMaps'] = list.join(',').replace(/,{2,}/g, ',');
        if (window.sessionStorage['TokenMaps'].substr(0, 1) === ',')
            window.sessionStorage['TokenMaps'] = window.sessionStorage['TokenMaps'].substr(1);
        if (window.sessionStorage['TokenMaps'].substr(window.sessionStorage['TokenMaps'].length - 1) === ',')
            window.sessionStorage['TokenMaps'] = window.sessionStorage['TokenMaps'].substr(0, window.sessionStorage['TokenMaps'].length - 1);
        SessionToken.$event.emit('tokenChanged', { action: 'add', location: 'session', "new": SessionToken.getObj(key) });
        SessionToken.$event.emit('tokenChanged:add', { location: 'session', "new": SessionToken.getObj(key) });
    };
    SessionToken.updateTimestamp = function (key) {
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        if (key)
            for (var i in list) {
                if (list[i].split(':')[0] === key && list[i].split(':')[4] == 1 && list[i].split(':')[5] == 0) {
                    SessionToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
                }
            }
        else
            for (var i in list) {
                if (list[i].split(':')[4] == 1 && list[i].split(':')[5] == 0)
                    SessionToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
            }
    };
    SessionToken.get = function (key) {
        if (!key)
            return typeof window.sessionStorage['TokenMaps'] === 'undefined' ? '' : window.sessionStorage['TokenMaps'];
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return '';
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].split(':')[0] === key && list[i].split(':')[5] == 0 && (parseInt(list[i].split(':')[3]) == -1 || (new Date().getTime() - list[i].split(':')[2]) <= parseInt(list[i].split(':')[3]) * 1000)) {
                //console.log(key + "=" + parseInt(list[i].split(':')[3]))
                if (list[i].split(':')[4] == 1)
                    SessionToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
                return list[i].split(':')[1];
            }
        }
        return '';
    };
    SessionToken.has = function (key) {
        if (!SessionToken.utils.notNull(key))
            return false;
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return false;
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].split(':')[0] === key && list[i].split(':')[5] == 0 && (parseInt(list[i].split(':')[3]) == -1 || (new Date().getTime() - list[i].split(':')[2]) <= parseInt(list[i].split(':')[3]) * 1000)) {
                return true;
            }
        }
        return false;
    };
    SessionToken["delete"] = function (key) {
        if (!SessionToken.utils.notNull(key))
            return;
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        var str, result = '', target = SessionToken.getObj(key);
        for (var i in list) {
            str = list[i].substr(0, list[i].indexOf(":"));
            if (str !== key) {
                result = result + "," + list[i];
            }
        }
        window.sessionStorage['TokenMaps'] = result.substr(1);
        if (SessionToken.utils.notNullStrAndObj(target)) {
            SessionToken.$event.emit('tokenChanged', { action: 'delete', location: 'session', target: target });
            SessionToken.$event.emit('tokenChanged:delete', { location: 'session', target: target });
        }
    };
    SessionToken.clear = function () {
        delete window.sessionStorage['TokenMaps'];
        SessionToken.$event.emit('tokenChanged', { action: 'clear', location: 'session' });
        SessionToken.$event.emit('tokenChanged:clear', { location: 'session' });
    };
    SessionToken.disable = function (key) {
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        var str, result = '', flag = false, old;
        if (key) {
            for (var i in list) {
                str = list[i].substr(0, list[i].indexOf(":"));
                if (str !== key) {
                    result = result + "," + list[i];
                }
                else {
                    flag = true;
                    result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':1';
                }
            }
            if (flag)
                old = SessionToken.getObj(key);
            window.sessionStorage['TokenMaps'] = result.substr(1);
            if (flag) {
                SessionToken.$event.emit('tokenChanged', { action: 'renew', location: 'session', "new": SessionToken.getObj(key), old: old });
                SessionToken.$event.emit('tokenChanged:renew', { location: 'session', "new": SessionToken.getObj(key), old: old });
            }
        }
        else {
            for (var i in list) {
                result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':1';
                old = SessionToken.getObj(key);
                old.disabled = '1';
                SessionToken.$event.emit('tokenChanged', {
                    action: 'renew',
                    location: 'session',
                    "new": old,
                    old: SessionToken.getObj(key)
                });
                SessionToken.$event.emit('tokenChanged:renew', { location: 'session', "new": old, old: SessionToken.getObj(key) });
            }
            window.sessionStorage['TokenMaps'] = result.substr(1);
        }
    };
    SessionToken.enable = function (key) {
        var list;
        if (typeof window.sessionStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.sessionStorage['TokenMaps'].split(",");
        }
        var str, result = '', flag = false, old;
        if (key) {
            for (var i in list) {
                str = list[i].substr(0, list[i].indexOf(":"));
                if (str !== key) {
                    result = result + "," + list[i];
                }
                else {
                    result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':0';
                }
            }
            if (flag)
                old = SessionToken.getObj(key);
            window.sessionStorage['TokenMaps'] = result.substr(1);
            if (flag) {
                SessionToken.$event.emit('tokenChanged', { action: 'renew', location: 'session', "new": SessionToken.getObj(key), old: old });
                SessionToken.$event.emit('tokenChanged:renew', { location: 'session', "new": SessionToken.getObj(key), old: old });
            }
        }
        else {
            for (var i in list) {
                result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':0';
                old = SessionToken.getObj(key);
                old.disabled = '0';
                SessionToken.$event.emit('tokenChanged', {
                    action: 'renew',
                    location: 'session',
                    "new": old,
                    old: SessionToken.getObj(key)
                });
                SessionToken.$event.emit('tokenChanged:renew', { location: 'session', "new": old, old: SessionToken.getObj(key) });
            }
            window.sessionStorage['TokenMaps'] = result.substr(1);
        }
    };
    return SessionToken;
}());
SessionToken.utils = emiya_js_utils_1.Utils;
SessionToken.$event = emiya_angular2_event_1.Event;
exports.SessionToken = SessionToken;
