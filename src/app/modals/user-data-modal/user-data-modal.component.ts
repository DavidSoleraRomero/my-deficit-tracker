import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-user-data-modal',
  templateUrl: './user-data-modal.component.html',
  styleUrls: ['./user-data-modal.component.scss'],
  standalone: false
})
export class UserDataModalComponent implements OnInit {
  age!: any;
  weight!: any;
  height!: any;
  gender!: any; 
  mode: string = 'new';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.loadProfileData();
  }
  
  async loadProfileData() {
    const profileData = await Preferences.get({ key: 'profile' });
    if (profileData.value) {
      const profile = JSON.parse(profileData.value);
      this.age = profile.age || undefined;
      this.weight = profile.weight || undefined;
      this.height = profile.height || undefined;
      this.gender = profile.gender || undefined;
      this.mode = 'edit';
    }
  }

  async submitData() {
    await Preferences.set({
      key: 'profile',
      value: JSON.stringify({
        age: this.age,
        weight: this.weight,
        height: this.height,
        gender: this.gender 
      })
    });

    this.modalController.dismiss();
    location.reload();
  }

  updateAge(event: any) {
    if (event.detail.value < 0) this.age = 0;
    if (event.detail.value > 125) this.age = 125;
    if (event.detail.value >= 0 && event.detail.value <= 125) this.age = event.detail.value;
  }
  
  updateWeight(event: any) {
    if (event.detail.value < 0) this.weight = 0;
    if (event.detail.value > 500) this.weight = 500;
    if (event.detail.value >= 0 && event.detail.value <= 500) this.weight = event.detail.value;
  }
  
  updateHeight(event: any) {
    if (event.detail.value < 0) this.height = 0;
    if (event.detail.value > 250) this.height = 250;
    if (event.detail.value >= 0 && event.detail.value <= 250) this.height = event.detail.value;
  }

  updateGender(event: any) {
    this.gender = event.detail.value;
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
