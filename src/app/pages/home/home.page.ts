import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AlertController, ModalController } from '@ionic/angular';
import { CalorieEntry, ExerciseEntry } from 'src/app/interfaces/daily-record.interface';
import { UserProfile } from 'src/app/interfaces/user-profile.interface';
import { UserDataModalComponent } from 'src/app/modals/user-data-modal/user-data-modal.component';
import { RecordService } from 'src/app/services/record.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  today: string = new Date().toISOString().split('T')[0];
  todayRecord: any = null;
  historicalRecords: any = [];

  newFood: string = '';
  newCalories: any = undefined;

  activityName: string = '';
  exerciseCalories: any = undefined;
  
  userProfile: any;

  constructor(
    private recordService: RecordService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    this.todayRecord = await this.recordService.getTodayRecord();
    this.historicalRecords = await this.recordService.getAllRecords();
    await this.checkUserData();
    this.userProfile = await this.getUserData();
  }

  getTotalWeightLost(): number {
    try {
      const totalDeficit = this.historicalRecords?.reduce((sum: any, record: any) => {
        const deficitSurplus = record.bmr - this.getTotalCaloriesFromEntries(record.entries);
        return sum + deficitSurplus;
      }, 0);

      const totalActivity = this.historicalRecords?.reduce((sum: any, record: any) => {
        const activity = record.exerciseEntries?.reduce((a: number, b: any) => a + b.calories, 0) || 0;
        return sum + activity;
      }, 0);
    
      return Math.max(0, (totalDeficit + totalActivity) / 7350); 
    } catch (_: any) {
      return 0;
    }
  }
  
  getUserBmr() {
    return this.recordService.calculateBMR(this.userProfile);
  }

  getActivityDone() {
    return this.todayRecord?.exerciseEntries?.reduce((a: number, b: any) => a + b.calories, 0) || 0;
  }

  async checkUserData() {
    const { value } = await Preferences.get({ key: 'profile' });

    if (!value) {
      this.showUserDataModal();
    }
  }

  async getUserData() {
    const { value } = await Preferences.get({ key: 'profile' })!;
    return (value) ? JSON.parse(value) : null;
  }

  async showUserDataModal() {
    const modal = await this.modalController.create({
      component: UserDataModalComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async addCalorieEntry() {
    if (this.newFood != '' && this.newCalories && this.newCalories > 0) {
      let entries = this.todayRecord ? this.todayRecord.entries : [];
      const newEntry = {
        food: this.newFood,
        calories: this.newCalories,
      };
  
      entries.push(newEntry);
  
      let bmr = this.todayRecord?.bmr;
  
      if (!bmr) {
        const profile = await this.recordService.getUserProfile();
        if (profile) {
          bmr = this.recordService.calculateBMR(profile);
        }
      }
  
      await this.recordService.saveOrUpdateRecord(entries, bmr);
      this.todayRecord = await this.recordService.getTodayRecord();
  
      this.newFood = '';
      this.newCalories = undefined;

      this.historicalRecords = await this.recordService.getAllRecords();
    } 
  }

  async addExerciseEntry() {
    if (this.activityName != '' &&  this.exerciseCalories > 0) {
      let exerciseEntries = this.todayRecord?.exercise || [];
  
      const newExerciseEntry: ExerciseEntry = {
        activity: this.activityName,  
        calories: this.exerciseCalories,
      };
  
      exerciseEntries.push(newExerciseEntry);
  
      let bmr = this.todayRecord?.bmr;
  
      if (!bmr) {
        const profile = await this.recordService.getUserProfile();
        if (profile) {
          bmr = this.recordService.calculateBMR(profile);
        }
      }
  
      await this.recordService.saveOrUpdateRecord(this.todayRecord?.entries || [], bmr, exerciseEntries);
      this.todayRecord = await this.recordService.getTodayRecord();
  
      this.activityName = '';
      this.exerciseCalories = undefined;
  
      this.historicalRecords = await this.recordService.getAllRecords();
    }
  }
  

  async deleteCalorieEntry(index: number) {
    const entry = this.todayRecord.entries[index];
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar "${entry.food}" con ${entry.calories} kcal?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.todayRecord.entries.splice(index, 1);
            this.recordService.saveOrUpdateRecord(this.todayRecord.entries, this.todayRecord.bmr);
            this.historicalRecords = await this.recordService.getAllRecords();
          }
        }
      ]
    });
  
    await alert.present();
  }

  async deleteExerciseEntry(index: number) {
    const entry = this.todayRecord?.exerciseEntries[index];
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la actividad "${entry?.activity}" con ${entry?.caloriesBurned} kcal quemadas?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.todayRecord.exerciseEntries.splice(index, 1);
            await this.recordService.saveOrUpdateRecord(
              this.todayRecord.entries,
              this.todayRecord.bmr,
              this.todayRecord.exerciseEntries
            );
            this.historicalRecords = await this.recordService.getAllRecords();
          }
        }
      ]
    });
  
    await alert.present();
  }  
  
  getTodaysCalories() {
    return (this.todayRecord?.entries) ?
      this.todayRecord.entries.reduce((a: number, b: any) => a + b.calories, 0) : 0;
  }

  getTotalCaloriesFromEntries(entries: CalorieEntry[]) {
    return entries.reduce((a: number, b: any) => a + b.calories, 0);
  }

  getRemainingCalories(bmr: number, consumedCalories: number) {
    return bmr - consumedCalories;
  }

  getWeightChangeStatus(bmr: number, consumedCalories: number): string {
    const remainingCalories = this.getRemainingCalories(bmr, consumedCalories);
    const roundedRemainingCalories = Math.round(remainingCalories); 
    
    if (roundedRemainingCalories < 0) {
      return `Ganaste ${Math.abs(roundedRemainingCalories)} kcal`;
    } else if (roundedRemainingCalories > 0) {
      return `Perdiste ${roundedRemainingCalories} kcal`;
    } else {
      return `Mantuviste tu peso`;
    }
  }
  
}
