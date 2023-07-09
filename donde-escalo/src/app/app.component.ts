import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { getPlaces, getUser, getWether, loginAnonymous } from './services/realm';
import * as suncalc from 'suncalc';

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
 
      const times = suncalc.getTimes(new Date(), place.position.lat, place.position.lng);


      const wetherDocs = this.wether.filter(w => w.place._id.toString() === place._id.toString());

      const maxTemp = Math.max(...wetherDocs.map(d => d.temp));
      const minTemp = Math.min(...wetherDocs.map(d => d.temp));
      const maxWind = Math.max(...wetherDocs.map(d => d.windGust));
      
      const maxPrecip = wetherDocs.map(d => d.precip).reduce((acc, current) => acc + current, 0);

      const cloudHigh = wetherDocs.map(d => d.cloudCover).reduce((acc, current) => acc + current.high, 0);
      const cloudMid = wetherDocs.map(d => d.cloudCover).reduce((acc, current) => acc + current.mid, 0);
      const cloudLow = wetherDocs.map(d => d.cloudCover).reduce((acc, current) => acc + current.low, 0);

      const cloud = wetherDocs.map(d => d.cloudCover).reduce((acc, current) => acc + current.high + current.mid + current.low, 0);
      const cloudMean = cloud / ( wetherDocs.length * 3 );
      
      place.maxTemp = maxTemp;
      place.minTemp = minTemp;
      place.maxWind = maxWind;
      place.maxPrecip = maxPrecip.toFixed(2);
      place.cloudMean = Math.round(cloudMean);

      place.cloudHigh = Math.round(cloudHigh / wetherDocs.length);
      place.cloudMid = Math.round(cloudMid / wetherDocs.length);
      place.cloudLow = Math.round(cloudLow / wetherDocs.length);

      place.sunrise = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();
      place.sunset = times.sunset.getHours() + ':' + times.sunset.getMinutes();

      let warning = 0;

      if (place.maxTemp < 15) warning++;
      if (place.maxTemp <= 5) warning =+ 2;
      if (place.maxWind > 50) warning++; 
      if (place.cloudLow >= 50) warning++; 
      if (place.maxPrecip >= 10) warning++; 

      place.warning = warning;
    });


    this.places = this.places.sort((a,b) => a.warning - b.warning);
  }
}
