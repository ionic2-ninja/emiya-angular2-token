#Emiya Angular2 Token

##How to install
```
npm install --save emiya-angular2-token
```


## Usage

```
import {Router} from 'emiya-angular2-token';

export class TabsPage {

constructor() {
    //set tokon
    Token.set('uuid','fasfasjfasjlk9312jkkfasjfaskl','local')  //set token to local/session storage
    
    //get token
    Token.get('uuid','local')    //return local token 'fasfasjfasjlk9312jkkfasjfaskl'
    Token.getObj('uuid','session')  //return object which contain all info of token
    
    //delete token
    Token.delete('uuid','local')
    
    //check if token exists
    Token.has('uuid','local')   //true or false
    Token.hasAll(['uuid',..],['local',..]) //true or false
    
    //update the last read timestamp
    Token.updateTimestamp('uuid','local')
    
    //delete all token
    Token.clear('local') //clear local token
    Token.clearAll()  //include local and session token
    
    //enable/disable token
    Token.enable('uuid','local')
    Token.disable('uuid','local')
    
    
    //subscribe to token event
    let tokenevent=Token.subscribe('uuid','local',(data)=>{//call when 'uuid' has been set},(data)=>{//call when 'uuid' has been deleted},false/*default is false,whether to exchange the third and forth params*/)
    
    Token.subscribe(['uuid','userid'],['session','local'],(data)=>{//call when 'uuid' has been deleted},(data)=>{//call when 'uuid' has been set},true)
    
    //unlisten to token event
    tokenevent.unsubscribe()
    
  }
}
```

##### it will use local by default if local/session is not defined

### Api Referrences(todo..)


