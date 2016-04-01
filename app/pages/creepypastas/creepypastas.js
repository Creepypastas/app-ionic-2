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
    this.creepypastas = JSON.parse( localStorage.getItem('creepypastas') || '[]' );
    this.searchQuery = '';

    http.get('https://public-api.wordpress.com/rest/v1/sites/creepypastas.com/posts/?number=100')
      .map(res => res.json())
      .subscribe(creepypastas => {
          this.creepypastas = creepypastas.posts.filter((item) => {
            if (typeof item.status !== 'undefined' && item.status === 'publish') {
              return true;
            }
            return false;
          })
          this.filteredCreepypastas = this.creepypastas;
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

  stringToDate(dateString) {
    return new Date(dateString);
  }

  requestDetailedCreepypasta(event, item) {
    this.nav.push(SinglePostPage, {
      item: item
    })
  }
}
