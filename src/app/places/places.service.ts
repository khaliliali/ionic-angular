import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

interface PlaceData {
    availableFrom: string;
    availableTo: string;
    description: string;
    imageUrl: string;
    price: number;
    title: string;
    userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlacesService {
    private _places = new BehaviorSubject<Place[]>([]);

    get places() {
        return this._places.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {}

    fetchPlaces() {
        return this.http
            .get<{ [key: string]: PlaceData }>(
                'https://ionic-angular-e9e98.firebaseio.com/offered-places.json'
            )
            .pipe(
                map(resData => {
                    const places = [];
                    for (const key in resData) {
                        if (resData.hasOwnProperty(key)) {
                            places.push(
                                new Place(
                                    key,
                                    resData[key].title,
                                    resData[key].description,
                                    resData[key].imageUrl,
                                    resData[key].price,
                                    new Date(resData[key].availableFrom),
                                    new Date(resData[key].availableTo),
                                    resData[key].userId
                                )
                            );
                        }
                    }
                    return places;
                    // return [];
                }),
                tap(places => {
                    this._places.next(places);
                })
            );
    }

    getPlace(id: string) {
        return this.http
            .get<PlaceData>(
                `https://ionic-angular-e9e98.firebaseio.com/offered-places/${id}.json`
            )
            .pipe(
                map(palceData => {
                    return new Place(
                        id,
                        palceData.title,
                        palceData.description,
                        palceData.imageUrl,
                        palceData.price,
                        new Date(palceData.availableFrom),
                        new Date(palceData.availableTo),
                        palceData.userId
                    );
                })
            );
    }

    addPlace(
        title: string,
        description: string,
        price: number,
        dateFrom: Date,
        dateTo: Date
    ) {
        let generateId: string;
        const newPlace = new Place(
            Math.random().toString(),
            title,
            description,
            'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
            price,
            dateFrom,
            dateTo,
            this.authService.userId
        );
        return this.http
            .post<{ name: string }>(
                'https://ionic-angular-e9e98.firebaseio.com/offered-places.json',
                { ...newPlace, id: null }
            )
            .pipe(
                switchMap(resData => {
                    generateId = resData.name;
                    return this.places;
                }),
                take(1),
                tap(places => {
                    newPlace.id = generateId;
                    this._places.next(places.concat(newPlace));
                })
            );
        // return this.places.pipe(
        //     take(1),
        //     delay(1000),
        //     tap(places => {
        //         this._places.next(places.concat(newPlace));
        //     })
        // );
    }

    updatePlace(placeId: string, title: string, description: string) {
        let updatedPlaces: Place[];
        return this.places.pipe(
            take(1),
            switchMap(places => {
                if (!places || places.length <= 0) {
                    return this.fetchPlaces();
                } else {
                    return of(places);
                }
            }),
            switchMap(places => {
                const updatedPlaceIndex = places.findIndex(
                    pl => pl.id === placeId
                );
                updatedPlaces = [...places];
                const oldPlace = updatedPlaces[updatedPlaceIndex];
                updatedPlaces[updatedPlaceIndex] = new Place(
                    oldPlace.id,
                    title,
                    description,
                    oldPlace.imageUrl,
                    oldPlace.price,
                    oldPlace.availableFrom,
                    oldPlace.availableTo,
                    oldPlace.userId
                );
                return this.http.put(
                    `https://ionic-angular-e9e98.firebaseio.com/offered-places/${placeId}.json`,
                    { ...updatedPlaces[updatedPlaceIndex], id: null }
                );
            }),
            tap(() => {
                this._places.next(updatedPlaces);
            })
        );
    }
}
