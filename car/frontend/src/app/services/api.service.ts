import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetDashboardData`);
  }

  getCars(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetCars`);
  }

  createNewCar(carData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateNewCar`, carData);
  }

  updateCar(carData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateCar`, carData);
  }

  deleteCarById(carId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteCarbyCarId/${carId}`);
  }

  getCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetCustomers`);
  }

  createNewCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateNewCustomer`, customerData);
  }

  updateCustomer(customerData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateCustomer`, customerData);
  }

  deleteCustomerById(customerId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeletCustomerById/${customerId}`);
  }

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/geAllBookings`);
  }

  filterBookings(filterData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/FilterBookings`, filterData);
  }

  getAllBookingsByCustomerId(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/geAllBookingsByCustomerId?customerId=${customerId}`);
  }

  getBookingByBookingId(bookingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetBookingByBookingId?bookingId=${bookingId}`);
  }

  createNewBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateNewBooking`, bookingData);
  }

  updateBooking(bookingData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateBooking`, bookingData);
  }

  deleteBookingById(bookingId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeletBookingById/${bookingId}`);
  }

  // Alternative delete method in case the parameter name is different
  deleteBookingByIdAlt(bookingId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeletBookingById/${bookingId}`);
  }
}