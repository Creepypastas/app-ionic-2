import {Page, Modal, Alert, NavController, NavParams} from 'ionic-angular';
import {CreepypastasService} from '../../providers/creepypastas-service/creepypastas-service';

import {SinglePostPage} from '../singlepost/singlepost';
import {PeopleModalPage} from '../people-modal/people-modal';

@Page({
  templateUrl: 'build/pages/creepypastas/creepypastas.html'
})
export class CreepypastasPage {
  static get parameters() {
    return [[NavController], [NavParams], [CreepypastasService]];
  }

  constructor(nav, navParams, creepypastasService) {
    var cpSelf = this;
    this.nav = nav;
    this.creepypastasService = creepypastasService;
    this.searchObject = navParams.get('searchObject');
    this.filteredCreepypastas = [];

    this.creepypastasService.lf.getItem('searchQuery').then(function(q){
      console.debug("app::creepypastas::q::", q);
      cpSelf.searchQuery =  q || '';
      console.debug("app::creepypastas::earchQuery::", cpSelf.searchQuery);

      cpSelf.filterCreepypastas(true,false,true);
    });

  }

  showPeopleModal() {
    console.debug("app::creepypastas::showPeopleModal(click)");
    let modal = Modal.create(
      PeopleModalPage,
      this.creepypastasService.getPeopleInfo()
    );
    this.nav.present(modal)
  }

  showOnlineCount() {
    this.creepypastasService.showUsersOnlineTOAST();
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
    console.debug("app::creepypastas::filterCreepypastas");
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
      console.debug("app::fCKV::", fCKV);

      cPSelf.filteredCreepypastas = fCKV;

      if(secondRound === true){
        console.debug("firstRound Listo. --> secondRound")
        cPSelf.filterCreepypastas(false,true,false);
      }
      if(fLocal === false){
        console.debug("forceLocal false listo. :)")
      }

      if(showAlerts === true || !secondRound){
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
