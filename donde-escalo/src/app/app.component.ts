import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { getPlaces, getUser, getWether, loginAnonymous } from './services/realm';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'donde-escalo';

  places: any[] = [];
  wether: any[] = [];

  async ngOnInit() {
    initFlowbite();
    await loginAnonymous();
    
    this.places = await getPlaces();
    this.wether = await  getWether();

    this.places.forEach(place => {
      const wetherDocs = this.wether.filter(w => w.place._id.toString() === place._id.toString());

      const maxTemp = Math.max(...wetherDocs.map(d => d.temp));
      const minTemp = Math.min(...wetherDocs.map(d => d.temp));
      const maxWind = Math.max(...wetherDocs.map(d => d.windGust));
      
      const maxPrecip = wetherDocs.map(d => d.precip).reduce((acc, current) => acc + current, 0);
      const cloud = wetherDocs.map(d => d.cloudCover).reduce((acc, current) => acc + current.high + current.mid + current.low, 0);
      const cloudMean = cloud / ( wetherDocs.length * 3 );
      
      place.maxTemp = maxTemp;
      place.minTemp = minTemp;
      place.maxWind = maxWind;
      place.maxPrecip = maxPrecip.toFixed(2);
      place.cloudMean = Math.round(cloudMean);


    });

  }
}
