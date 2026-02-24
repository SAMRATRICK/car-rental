// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, tap } from 'rxjs';
// import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private http = inject(HttpClient);
//   private baseUrl = environment.apiUrl;
//   public backendUrl = environment.backendUrl;
//   private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
//   public isLoggedIn$ = this.isLoggedInSubject.asObservable();

//   constructor() {}

//   login(username: string, password: string) {
//     return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
//       tap((response) => {
//         if (response.result && response.data?.token) {
//           localStorage.setItem('authToken', response.data.token);
//           this.isLoggedInSubject.next(true);
//         }
//       })
//     );
//   }

//   register(username: string, fullName: string, email: string, password: string) {
//     return this.http.post<any>(`${this.baseUrl}/register`, { username, fullName, email, password });
//   }

//   getProfile() {
//     return this.http.get<any>(`${this.baseUrl}/profile`);
//   }

//   updateProfile(profileData: any, file?: File) {
//     const formData = new FormData();
    
//     // Add text fields
//     if (profileData.email) formData.append('email', profileData.email);
//     if (profileData.phone) formData.append('phone', profileData.phone);
    
//     // Add file if provided
//     if (file) {
//       formData.append('profilePicture', file);
//     }
    
//     return this.http.put<any>(`${this.baseUrl}/profile`, formData);
//   }

//   requestEmailChange(currentEmail: string) {
//     return this.http.post<any>(`${this.baseUrl}/request-email-change`, { currentEmail });
//   }

//   verifyEmailOtp(otp: string) {
//     return this.http.post<any>(`${this.baseUrl}/verify-email-otp`, { otp });
//   }

//   changeEmail(otp: string, newEmail: string) {
//     return this.http.post<any>(`${this.baseUrl}/change-email`, { otp, newEmail });
//   }

//   logout(): void {
//     localStorage.removeItem('authToken');
//     this.isLoggedInSubject.next(false);
//   }

//   isAuthenticated(): boolean {
//     return this.hasToken();
//   }

//   getToken(): string | null {
//     return localStorage.getItem('authToken');
//   }

//   private hasToken(): boolean {
//     return !!localStorage.getItem('authToken');
//   }

//   /**
//    * Converts a relative profile picture path to an absolute URL
//    * @param profilePicture - The profile picture path from the API
//    * @returns Full URL to the profile picture
//    */
//   getProfilePictureUrl(profilePicture: string | null | undefined, fallbackName: string = 'User'): string {
//     if (!profilePicture) {
//       return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=4F46E5&color=fff&size=150`;
//     }
    
//     // If it's already a full URL (http/https), return as is
//     if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
//       return profilePicture;
//     }
    
//     // If it starts with /uploads, remove the leading slash
//     if (profilePicture.startsWith('/uploads')) {
//       profilePicture = profilePicture.substring(1);
//     }
    
//     // Construct full URL
//     return `${this.backendUrl}/${profilePicture}`;
//   }
// }


import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  public backendUrl = environment.backendUrl;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((response) => {
        if (response.result && response.data?.token) {
          localStorage.setItem('authToken', response.data.token);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  register(username: string, fullName: string, email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/register`, { username, fullName, email, password });
  }

  getProfile() {
    return this.http.get<any>(`${this.baseUrl}/profile`);
  }

  updateProfile(profileData: any, file?: File) {
    const formData = new FormData();

    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (file) formData.append('profilePicture', file);

    return this.http.put<any>(`${this.baseUrl}/profile`, formData);
  }

  requestEmailChange(currentEmail: string) {
    return this.http.post<any>(`${this.baseUrl}/request-email-change`, { currentEmail });
  }

  verifyEmailOtp(otp: string) {
    return this.http.post<any>(`${this.baseUrl}/verify-email-otp`, { otp });
  }

  changeEmail(otp: string, newEmail: string) {
    return this.http.post<any>(`${this.baseUrl}/change-email`, { otp, newEmail });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isLoggedInSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // ✅ FIXED VERSION
  getProfilePictureUrl(
    profilePicture: string | null | undefined,
    fallbackName: string = 'User'
  ): string {

    if (!profilePicture || profilePicture.trim() === '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fallbackName
      )}&background=4F46E5&color=fff&size=150`;
    }

    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }

    const cleanBaseUrl = this.backendUrl.endsWith('/')
      ? this.backendUrl.slice(0, -1)
      : this.backendUrl;

    const cleanPath = profilePicture.startsWith('/')
      ? profilePicture.substring(1)
      : profilePicture;

    return `${cleanBaseUrl}/${cleanPath}`;
  }
}