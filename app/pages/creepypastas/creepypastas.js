import {Page, Alert, NavController, NavParams} from 'ionic-angular';
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
    this.filterCreepypastas(true,false,true);
  }

  doAlert(count) {
    if(!count){
      return;
    }
  var alert = Alert.create({
    title: '¡Listo!',
    message: 'Descargaste ' + count + ' nuevos creepypastas',
    buttons: ['Ok']
  });
  this.nav.present(alert);
}

doRefresh(){
  console.log("refresh");
  this.filterCreepypastas(false,true,false);
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


  filterCreepypastas(fLocal,showAlerts,secondRound){
    var cPSelf = this;
    cPSelf.isLoading = true;
    var searchCriteria = {
      query: cPSelf.searchQuery || '',
      forceLocal: fLocal
    };

    if(cPSelf.searchObject){
      searchCriteria.categoryID = cPSelf.searchObject.ID;
      searchCriteria.categorySlug = cPSelf.searchObject.slug;
    }

    var creepypastasPromise = cPSelf.creepypastasService.loadCreepypastas(searchCriteria);
    creepypastasPromise.then(function(fCKV) {
      cPSelf.filteredCreepypastas = fCKV;
      console.log(fCKV);
      console.log(cPSelf);

      if(secondRound === true){
        console.debug("firstRound Listo. --> secondRound")
        cPSelf.filterCreepypastas(false,true,false);
      }
      if(fLocal === false){
        console.debug("forceLocal false listo. :)")
      }

      if(showAlerts === true){
        setTimeout(function() {
          console.log("creepypastas updated");
          cPSelf.isLoading = false;
        }, 500)
      }

    })

  }

  requestDetailedCreepypasta(event, item) {
    this.nav.push(SinglePostPage, {
      item: item
    })
  }
}
