import {Page, NavController, NavParams} from 'ionic-angular';
import {CreepypastasService} from '../../providers/creepypastas-service/creepypastas-service';

import {SinglePostPage} from '../singlepost/singlepost';

@Page({
  templateUrl: 'build/pages/creepypastas/creepypastas.html'
})
export class CreepypastasPage {
  static get parameters() {
    return [[NavController], [NavParams], [CreepypastasService]];
  }

  constructor(nav, navParams, creepypastasService) {
    this.nav = nav;
    this.creepypastasService = creepypastasService;
    this.searchObject = navParams.get('searchObject');
    this.searchQuery = localStorage.getItem('searchQuery') || '';

    this.filteredCreepypastas = [];
    this.filterCreepypastas();
  }

  stringToDate(dateString) {
    return new Date(dateString);
  }

  dateFormat(dateString, dateFormat) {
    var d = new Date(dateString);
    switch (dateFormat) {
      default:
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    }
  }

  filterCreepypastas(){
    var creepypastasPageSelf = this;

    var searchCriteria = {
      query: this.searchQuery
    }

    if(this.searchObject){
      searchCriteria.categoryID = this.searchObject.ID;
      searchCriteria.categorySlug = this.searchObject.slug;
    }

    var creepypastasPromise = this.creepypastasService.loadCreepypastas(searchCriteria);
    creepypastasPromise.then(function(filteredCreepypastasKV) {
      creepypastasPageSelf.filteredCreepypastas = filteredCreepypastasKV;
    });

  }

  requestDetailedCreepypasta(event, item) {
    this.nav.push(SinglePostPage, {
      item: item
    })
  }
}
