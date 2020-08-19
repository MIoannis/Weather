import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { WeatherService } from '../weather.service';

import { SessionService } from '../Store/session.service';
import { SessionQuery } from '../Store/session.query';

import { Subscription } from 'rxjs';
import { tap, take, map } from 'rxjs/operators';

import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { CityList } from '../CityList';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  animations: [
    trigger('moveUp', [
      state('center', style({
        height: '90%',
      })),
      state('up', style({
        height: '60%',
      })),
      transition('center => up', [
        animate('1s ease-in-out')
      ]),
    ]),
    trigger('changeOpacity', [
      state('zero', style({
        opacity: 0
      })),
      state('full', style({
        opacity: 1
      })),
      transition('zero => full', [
        animate('1.5s')
      ]),
    ]),
    trigger('insertTrigger', [
      transition(':enter', [
        style({top: '125%'}),
        animate('1s ease-in-out', style({ left: '20%', top: '67%' })),
      ]),
    ]),
    trigger( 'sideSettings', [
      transition(':enter', [
        style({right: '-30%'}),
        animate('1s ease-in-out', style({ right: '0%' })),
      ]),
      transition(':leave', [
        style({right: '0%'}),
        animate('1s ease-in-out', style({ right: '-30%' })),
      ]),
    ]),
  ]
})
export class MainpageComponent implements OnInit {
  private fvar: Subscription;
  private svar: Subscription;

  faSearch = faSearch;

  animVar: boolean;
  secondAnimVar: boolean;
  setVar: boolean;

  degreeLetter: string;
  currentSystem: string;
  formValue: string;
  speedSystem: string;

  cities = new Map<string, string[]>();
  mySet = new Set<string>();

  filteredCities: string[] = [];
  showedCities: string[] = [];

  constructor(private sessionService: SessionService,
              private weatherService: WeatherService,
              public sessionQuery: SessionQuery) {
  }

  ngOnInit() {
    this.fvar = this.sessionQuery.animVar$.subscribe(x => this.animVar = x);
    this.svar = this.sessionQuery.secondAnimVar$.subscribe(x => this.secondAnimVar = x);

    this.weatherService.getTowns()
      .pipe(
        take(1),
        tap((cities: CityList[]) => {cities.forEach((city: CityList) => {
          this.cities.set(city.name[0], [city.name].concat( this.cities.get(city.name[0]) ));
        });
        })
      ).pipe(
        map((cities: CityList[]) => {
        cities.length = 0;
      })).subscribe();

    this.sessionQuery.searchValue$.subscribe(x => this.formValue = x);
    this.sessionQuery.setVar$.subscribe(x => this.setVar = x);
    this.sessionQuery.currentSystem$.subscribe(x => this.currentSystem = x);
    this.sessionQuery.degreeLetter$.subscribe(x => this.degreeLetter = x);
    this.sessionQuery.speedSystem$.subscribe(x => this.speedSystem = x);
  }

  submitCity(form: NgForm) {
    this._update(form.value.search, this.currentSystem);
    this.fvar.unsubscribe();
    this.svar.unsubscribe();
  }

  _update(searchValue: string, currentSystem: string) {
    this.sessionService.updateData(searchValue, currentSystem);
    this.sessionService.updateValue(searchValue);
    this.sessionService.updateAnimVar(false, true);
  }

  search(form: NgForm) {
    this.showedCities.length = 0;
    form.valueChanges.pipe(
      take(1), tap(value => {
        if(value.search.length === 1) {
          this.filteredCities = this.cities.get(value.search).filter(y => y !== undefined);
          while (this.filteredCities.length !== 0) {
            this.mySet.add( this.filteredCities.pop() );
          }
        }
      })
    ).pipe(
      tap(value => {this.mySet.forEach(element => {
        if(element.indexOf(value.search) !== -1 && value.search.length > 1) {
          this.showedCities.push(element);
        }
      });
      })
    ).subscribe();
  }
}
