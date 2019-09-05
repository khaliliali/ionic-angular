import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacesRoutingModule } from './places-routing.module';

import { IonicModule } from '@ionic/angular';

import { PlacesPage } from './places.page';

@NgModule({
    imports: [CommonModule, IonicModule, PlacesRoutingModule],
    declarations: [PlacesPage]
})
export class PlacesPageModule {}
