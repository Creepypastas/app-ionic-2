import {IonicApp, Modal, Platform, NavController, NavParams, Page, ViewController} from 'ionic-angular';
@Page({
  templateUrl: 'build/pages/people-modal/people-modal.html',
})
export class PeopleModalPage {
  static get parameters() {
    return [[Platform],[NavParams],[ViewController]];
  }

  constructor(platform, navParams, viewCtrl) {
    console.debug("app::PeopleModalPage::constructor");
    this.platform = platform;
    this.navParams = navParams;
    this.viewCtrl = viewCtrl;

    console.debug("app::PeopleModalPage::navParams::", this.navParams);
    this.userCount = this.navParams.get('userCount');
    console.debug("app:PeopleModalPage::userCount::", this.userCount);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
