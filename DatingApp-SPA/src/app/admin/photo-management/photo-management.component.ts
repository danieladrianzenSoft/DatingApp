import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AdminService } from 'src/app/_services/admin.service';
import { Pagination } from 'src/app/_models/Pagination';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.scss']
})
export class PhotoManagementComponent implements OnInit {
  photos: any;
  pagination: Pagination;

  constructor(private authService: AuthService, private alertify: AlertifyService,
              private adminService: AdminService) { }

  ngOnInit(): void {
    this.getPhotosToModerate();
  }

  getPhotosToModerate(): any{
    this.adminService.getPhotosForModeration().subscribe((photos) => {
      this.photos = photos;
    }, error => {
      this.alertify.error(error);
    });
  }

  approvePhoto(photoId: number): any{
    this.adminService.approvePhoto(photoId).subscribe(() => {
      this.photos.splice(this.photos.findIndex(p => p.id === photoId, 1));
    }, error => {
      this.alertify.error(error);
    });
  }

  rejectPhoto(photoId: number): any{
    this.adminService.rejectPhoto(photoId).subscribe(() => {
      this.photos.splice(this.photos.findIndex(p => p.id === photoId), 1);
    }, error => {
      this.alertify.error(error);
    });
  }

}
