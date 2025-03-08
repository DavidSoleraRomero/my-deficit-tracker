import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HomeBackgroundLogoComponent } from 'src/app/components/home-background-logo/home-background-logo.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HomeBackgroundLogoComponent
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
