import {Injectable} from 'angular2/core';
import io from 'socket.io-client';

@Injectable()
export class Socket {
  static get parameters(){
    return [];
  }

  constructor() {
    console.log("app::socket::constructor");
    var Promise = require("bluebird");
    this.socket = io('https://wss.creepypastas.com:8000');
    this.socket.emitAsync = Promise.promisify(socket.emit);

    this.lastSeen = {
      userCount:0
    };

    this.socket.on('connect', function(){});
    this.socket.on('disconnect', function(){});

    this.socket.emit('user::enter', {user:'guest'});
  }

  getSocket() {
    return this.socket;
  }

}
