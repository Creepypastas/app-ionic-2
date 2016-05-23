import {Injectable} from 'angular2/core';

@Injectable()
export class UserService {
  static get parameters(){
    return [];
  }

  constructor() {
    this.user = {
      credentials : {
        username : 'invitado',
        token : 'nometoken'
      },
      gangs : [
        {name:'neófitos',people:162},
        {name:'rockers',people:87}
      ]
    };

    this.lf = localforage.createInstance({
      name: 'user.creepypastas.com'
    });

    this.loadFromLF();
  }

  loadFromLF() {
    var self = this;
    console.debug("app::userService::asyncLoadFromLocalForage");
    var user = this.lf.getItem('userCredentials');
    var gangs = this.lf.getItem('userGangs');

    return Promise.all([user, gangs]).then(function(values) {
      console.debug("app::UserService::asyncLoadFromLocalForage::resolve:all");
      if (values[0]) {
        self.user.credentials = values[0];
      }
      if (values[1]) {
        self.user.gangs = values[1];
      }
      console.debug("app::userService::asyncLoadFromLocalForage::resolve::all", self.user);
      return Promise.resolve(self.user);
    });
  }

  saveToLF(name, object) {
    this.lf.setItem(name, object);
  }

  startNewGang(newGang) {
    var newGangRequest = {
      userCredentials: this.user.credentials,
      newGang: newGang
    };

    this.socketService.getSocket().emit('user::startNewGang', newGangRequest);
  }
  
}
