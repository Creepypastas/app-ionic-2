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
    this.http = http;
    this.nav = nav;
    this.searchObject = navParams.get('searchObject');
    this.searchQuery = localStorage.getItem('searchQuery') || '';

    this.creepypastasKV = eval( localStorage.getItem('creepypastas') || '[]' );
    this.creepypastasMap = new Map(this.creepypastasKV);
    this.apiURL = 'https://public-api.wordpress.com/rest/v1/sites/creepypastas.com';
    this.filterCreepypastas({value:this.searchQuery});

    var requestURL =  this.apiURL + '/posts/' + '?number=100';
    if( this.searchObject ){
      requestURL+='&category=';
      requestURL+=this.searchObject.slug;
    }

    this.getCreepypastasFromApi(requestURL);
  }

  getCreepypastasFromApi(requestURL){
    this.http.get(requestURL)
      .map(res => res.json())
      .subscribe(creepypastas => {
          creepypastas.posts.filter((item) => {
            if (typeof item.status !== 'undefined' && item.status === 'publish') {
              this.creepypastasMap.set(item.ID, item);
              return true;
            }
            return false;
          })
          localStorage.setItem('creepypastas', uneval([...this.creepypastasMap]));
          this.creepypastasKV = eval( localStorage.getItem('creepypastas') || '[]' );
          this.filterCreepypastas({value:this.searchQuery});
        }
      );
  }

  filterCreepypastas(searchbar) {
    var q = searchbar.value.replace(/[_\W]/g, '').toLowerCase();
    localStorage.setItem('searchQuery', q);

    this.filteredCreepypastas = this.creepypastasKV.filter((item) => {
      if (q === '' && !this.searchObject){
        return true;
      }
      if (item[1].title.replace(/[_\W]/g, '').toLowerCase().indexOf(q) <= -1) {
        return false;
      }
      if (this.searchObject && !this.itemHasCategory(item[1], this.searchObject.ID)){
        return false;
      }
      return true;
    })

  }

  itemHasCategory(item,categoryID) {
    for (var cat in item.categories) {
      if (item.categories.hasOwnProperty(cat)) {
        if(item.categories[cat].ID === categoryID){
          return true;
        }
      }
    }
    return false;
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
