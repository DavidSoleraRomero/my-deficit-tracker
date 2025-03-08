import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CalorieEntry, DailyRecord } from '../interfaces/daily-record.interface';
import { UserProfile } from '../interfaces/user-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  async saveOrUpdateRecord(
    entries: CalorieEntry[],
    bmr?: number,
    caloriesLost?: number
  ): Promise<void> {
    const today = this.getTodayDate();
    const record: DailyRecord = { date: today, entries, bmr, caloriesLost };
    await Preferences.set({ key: today, value: JSON.stringify(record) });

    const { value } = await Preferences.get({ key: 'dates' });
    let dates: string[] = value ? JSON.parse(value) : [];
    if (!dates.includes(today)) {
      dates.push(today);
      await Preferences.set({ key: 'dates', value: JSON.stringify(dates) });
    }
  }

  async getTodayRecord(): Promise<DailyRecord | null> {
    const today = this.getTodayDate();
    const { value } = await Preferences.get({ key: today });
    return value ? JSON.parse(value) : null;
  }

  async getAllRecords(): Promise<DailyRecord[]> {
    const { value } = await Preferences.get({ key: 'dates' });
    const dates: string[] = value ? JSON.parse(value) : [];
    const records = await Promise.all(
      dates.map(async (date) => {
        const { value } = await Preferences.get({ key: date });
        return value ? JSON.parse(value) : null;
      })
    );
    return records.filter((r) => r !== null);
  }

  async deleteRecord(date: string): Promise<void> {
    await Preferences.remove({ key: date });
    const { value } = await Preferences.get({ key: 'dates' });
    let dates: string[] = value ? JSON.parse(value) : [];
    dates = dates.filter((d) => d !== date);
    await Preferences.set({ key: 'dates', value: JSON.stringify(dates) });
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await Preferences.set({ key: 'profile', value: JSON.stringify(profile) });
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const { value } = await Preferences.get({ key: 'profile' });
    return value ? JSON.parse(value) : null;
  }

  calculateBMR(profile: UserProfile): number {
    if (profile.gender === "Masculino") {
      return 66 + (13.7 * profile.weight) + (5 * profile.height) - (6.8 * profile.age);
    } else {
      return 655 + (9.6 * profile.weight) + (1.8 * profile.height) - (4.7 * profile.age);
    }
  }

}