import {Page, Loading, NavController} from 'ionic-angular';
/*
  Generated class for the ConfigPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/config/config.html',
})
export class ConfigPage {
  static get parameters() {
    this.configSegment = 'user';
    return [[NavController]];
  }

  buyNoAds(){
    if(typeof inAppPurchase === 'undefined' || !inAppPurchase){
      var loading = Loading.create({
        spinner: 'hide',
        content: 'Las compras no están disponibles',
        duration: 2000
      });
      this.presentLoading(loading);
      return false;
    }

    this.presentLoading();

    inAppPurchase
      .getProducts(['com.creepypastas.beta.noads'])
      .then(function (products) {
        console.log(products);

        inAppPurchase
          .buy('com.creepypastas.beta.noads')
          .then(function (data) {
            dismissLoading();
            console.log(data);
          })
          .catch(function (err) {
            dismissLoading();
            console.log(err);
          });

      })
      .catch(function (err) {
        dismissLoading();
        console.log(err);
      });
  }

  presentLoading(customLoading) {
    if(typeof customLoading === 'undefined' || ! customLoading) {
      this.nav.present(this.loading);
    } else {
      this.nav.present(customLoading);
    }
  }

  dismissLoading(){
    this.loading.dismiss();
  }

  constructor(nav) {
    this.nav = nav;
    this.loading = Loading.create({
      content: 'Cargando...'
    });
  }
}
