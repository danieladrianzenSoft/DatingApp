import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { AuthService } from 'src/app/_services/auth.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(private userService: UserService, private alertify: AlertifyService,
              private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): any {
    this.route.data.subscribe(data => {
      this.user = data.user;
    });

    this.route.queryParams.subscribe(params => {
      const selectedTab = params.tab;
      this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();

  }

  getImages(): any{
    const imageUrls = [];
    for (const photo of this.user.photos){
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        decription: photo.description
      });
    }
    return imageUrls;
  }

  selectTab(tabId: number): any{
    this.memberTabs.tabs[tabId].active = true;
  }

  // loggedIn(): boolean {
  //   return this.authService.loggedIn();
  //   // !! is shorthand for an if statement: if there's something in the token
  //   // return true, otherwise return false.
  // }

}
