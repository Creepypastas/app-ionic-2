import {Page, NavController, NavParams} from 'ionic-angular';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

@Page({
  templateUrl: 'build/pages/creepypastas/creepypastas.html'
})
export class CreepypastasPage {
  static get parameters() {
    return [[NavController], [NavParams], [Http]];
  }

  constructor(nav, navParams, http) {
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.originItem = navParams.get('item');
    this.creepypastas = [];

    http.get('https://creepypastas.com/wdgts/mrddrs.creepypastas.com/publish.json')
      .map(res => res.json())
      .subscribe(creepypastas => this.creepypastas = creepypastas);
  }

  itemTapped(event, item) {
    this.nav.push(CreepypastasPage, {
      item: item
    })
  }
}
