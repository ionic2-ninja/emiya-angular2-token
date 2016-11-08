'use strict'
import {LocalToken} from './LocalToken'
import {Utils} from 'emiya-js-utils'
import {Event} from 'emiya-angular2-event'
import {SessionToken} from './SessionToken'

const constants = {tokenStorageMethod: 'local'};

export class Token {

  private static localToken = LocalToken;
  private static sessionToken = SessionToken;
  private static event = Event;
  private static utils = Utils

  public static set(key, token, expiry_time = null, can_refresh = null, disabled = null, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      Token.localToken.set(key, token, expiry_time, can_refresh, disabled);
    else
      Token.sessionToken.set(key, token, expiry_time, can_refresh, disabled);
  }

  public static updateTimestamp(key, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      Token.localToken.updateTimestamp(key);
    else
      Token.sessionToken.updateTimestamp(key);
  }

  public static get(key, method = null): any {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      return Token.localToken.get(key);
    else
      return Token.sessionToken.get(key);
  }


  public static has(key, method = null) {
    if (key instanceof Array)
      return Token.hasAll(key, method)
    else {
      if (!method)
        method = constants.tokenStorageMethod;
      return method === 'local' ? Token.localToken.has(key) : Token.sessionToken.has(key);
    }
  }

  public static delete(key, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      Token.localToken.delete(key);
    else
      Token.sessionToken.delete(key);
  }

  public static clear(method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      Token.localToken.clear()
    //delete window.localStorage['TokenMaps'];
    else
      Token.sessionToken.clear()
    //delete window.sessionStorage['TokenMaps'];
  }

  public static clearAll() {
    Token.localToken.clear()
    Token.sessionToken.clear()
  }

  public static getObj(key, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      return Token.localToken.getObj(key);
    else
      return Token.sessionToken.getObj(key);
  }

  public static enable(key, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      return Token.localToken.enable(key);
    else
      return Token.sessionToken.enable(key);
  }

  public static disable(key, method = null) {
    if (!method)
      method = constants.tokenStorageMethod;

    if (method === 'local')
      return Token.localToken.disable(key);
    else
      return Token.sessionToken.disable(key);
  }

  public static hasAll(key, location = null) {
    for (var c in key) {
      if (Token.has(key[c], (location instanceof Array) && parseInt(c) < location.length ? location[c] : constants.tokenStorageMethod) == false) {
        return false;
      }
    }
    return true;
  }

  public static subscribe(tokens, method = null, onPass: Function = null, onDeny: Function = null, reverse = false) {
    if (!onDeny && !onPass)
      return
    if (!(tokens instanceof Array))
      tokens = [tokens]

    if (!(method instanceof Array)) {
      let _method = method ? method : constants.tokenStorageMethod;
      method = []
      for (let c in tokens)
        method.push(_method)
    }

    let status = [];
    for (let c in tokens) {
      let d = {key: tokens[c], method: null, invalid: null}
      if (method && c < method.length)
        d.method = method[c]
      else
        d.method = constants.tokenStorageMethod
      status.push(d)
    }

    let lastStatus = Token.has(tokens, method);

    for (let c in status) {
      status[c].invalid = lastStatus
    }

    if (reverse == true) {
      let _exchange = onDeny
      onDeny = onPass
      onPass = _exchange
    }

    if (lastStatus == true) {
      if (onPass)
        onPass(Token.utils.deepCopy(status));
    } else {
      if (onDeny)
        onDeny(Token.utils.deepCopy(status));
    }

    let removeL, addL, clearL

    if (onPass)
      addL = Token.event.subscribe('tokenChanged:add', (ev,data)=> {

        for (let c in status) {
          if (status[c].method == data.location && status[c].key == data.new.key) {
            status[c].invalid = true
            break
          }
        }
        let all = true
        for (let c in status) {
          if (status[c].invalid == false) {
            all = false
            break
          }
        }

        //console.log(all, status)

        if (lastStatus != true && all == true) {
          lastStatus = false
          onPass(Token.utils.deepCopy(status))
        }
      })

    if (onDeny)
      removeL = Token.event.subscribe('tokenChanged:delete', (ev,data)=> {
        for (let c in status) {
          if (status[c].method == data.location && status[c].key == data.target.key) {
            status[c].invalid = false
            break
          }
        }
        let all = true
        for (let c in status) {
          if (status[c].invalid == false) {
            all = false
            break
          }
        }

        if (lastStatus != false && all == false) {
          lastStatus = false
          onDeny(Token.utils.deepCopy(status))
        }
      })

    if (onDeny)
      clearL = Token.event.subscribe('tokenChanged:clear', (ev,data)=> {
        for (let c in status) {
          if (status[c].method == data.location)
            status[c].invalid = false
        }

        let all = true
        for (let c in status) {
          if (status[c].invalid == false) {
            all = false
            break
          }
        }

        if (lastStatus != false && all == false) {
          lastStatus = false
          onDeny(Token.utils.deepCopy(status))
        }
      })


    return {
      unsubscribe: ()=> {
        if (addL)
          addL.unsubscribe();
        if (removeL)
          removeL.unsubscribe();
        if (clearL)
          clearL.unsubscribe()
      }
    }

  }

}
