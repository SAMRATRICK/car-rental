import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient){}

  getAllBooking(){
    return this.http.get("https://freeapi.miniprojectideas.com/api/CarRentalApp/geAllBookings")
  }

  getAllCars(){
    return this.http.get("https://freeapi.miniprojectideas.com/api/CarRentalApp/GetCars")
  }
}

