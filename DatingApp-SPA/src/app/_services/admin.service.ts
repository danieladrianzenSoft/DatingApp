import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { Photo } from '../_models/photo';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../_models/Pagination';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsersWithRoles(): any{
    return this.http.get(this.baseUrl + 'admin/usersWithRoles');
  }

  updateUserRoles(user: User, roles: {}): any{
    return this.http.post(this.baseUrl + 'admin/editRoles/' + user.userName, roles);
  }

  getPhotosForModeration(): any {
    return this.http.get<Photo[]>(this.baseUrl + 'admin/photosForModeration');
  }

  approvePhoto(photoId: number): any{
    return this.http.post(this.baseUrl + 'admin/approvePhoto/' + photoId, {});
  }

  rejectPhoto(photoId: number): any{
    return this.http.post(this.baseUrl + 'admin/rejectPhoto/' + photoId, {});
  }

}
