import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { AuthService } from 'src/app/_services/auth.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Like } from 'src/app/_models/like';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  user: User;
  like: Like;
  // lastActive: any;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(private userService: UserService, private alertify: AlertifyService,
              private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): any {
    this.route.data.subscribe(data => {
      this.user = data.user;
      // this.lastActive = this.user.lastActive.toString();
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

  sendLikeUnlike(id: number): any{
    // this id represents recipient id.
    this.userService.sendLikeUnlike(this.authService.decodedToken.nameid, id).subscribe( data => {
      if (data === true) {
        this.alertify.warning('You have unliked: ' + this.user.displayName);
      }
      else{
        this.alertify.success('You have liked: ' + this.user.displayName);
      }
    }, error => {
        this.alertify.error(error);
    });

  }
}

