import {Page, NavController, NavParams} from 'ionic-angular';
import {CreepypastasService} from '../../providers/creepypastas-service/creepypastas-service';

@Page({
  templateUrl: 'build/pages/singlepost/singlepost.html'
})
export class SinglePostPage {
  static get parameters() {
    return [[NavController], [NavParams], [CreepypastasService]];
  }

  constructor(nav, navParams, creepypastasService) {
    this.nav = nav;
    this.creepypastasService = creepypastasService;
    this.requestedItem = navParams.get('item');
    this.ensureSingleIsLoaded();
  }

  goRandom(){
    console.log("let's go random");
    this.requestedItem = this.creepypastasService.getRandomCreepypasta();
    this.ensureSingleIsLoaded();
  }

  ensureSingleIsLoaded(){
    if(this.requestedItem && !this.requestedItem[1].content){
      var sPSelf = this;
      sPSelf.isLoading = true;

      console.debug("app::ensureSingleIsLoaded from creepypastasService");
      var singlePromise = sPSelf.creepypastasService.loadSinglePost(sPSelf.requestedItem[1].ID);
      singlePromise.then(function(singlePost) {
        console.log(singlePost);
        if(singlePost.success){
          sPSelf.requestedItem[1] = singlePost.data;
          sPSelf.isLoading = false;
        }
      })

    }
  }


}
