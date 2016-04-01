import {Page, NavController, NavParams} from 'ionic-angular';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

import {SinglePostPage} from '../singlepost/singlepost';

@Page({
  templateUrl: 'build/pages/creepypastas/creepypastas.html'
})
export class CreepypastasPage {
  static get parameters() {
    return [[NavController], [NavParams], [Http]];
  }

  constructor(nav, navParams, http) {
    this.nav = nav;
    this.searchObject = navParams.get('searchObject');
    this.creepypastas = [];
    this.searchQuery = '';

    http.get('https://creepypastas.com/wdgts/mrddrs.creepypastas.com/publish.json')
      .map(res => res.json())
      .subscribe(creepypastas => {
          this.creepypastas = creepypastas;
          this.filteredCreepypastas = creepypastas;
        }
      );
  }

  filterCreepypastas(searchbar) {
    var q = searchbar.value.replace(/[_\W]/g, '').toLowerCase();
    if (q == '') {
      this.filteredCreepypastas = this.creepypastas;
      return;
    }

    this.filteredCreepypastas = this.creepypastas.filter((item) => {
      if (item.post_title.replace(/[_\W]/g, '').toLowerCase().indexOf(q) > -1) {
        return true;
      }
      return false;
    })
  }

  requestDetailedCreepypasta(event, item) {
    this.nav.push(SinglePostPage, {
      item: item
    })
  }
}
