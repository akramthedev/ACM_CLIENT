import { Component, PLATFORM_ID, Inject, } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { map, delay, withLatestFrom } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';
// import { TranslateService } from '@ngx-translate/core';
import { UserIdleService } from 'angular-user-idle';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // For Progressbar
  loaders = this.loader.progress$.pipe(
    delay(1000),
    withLatestFrom(this.loader.progress$),
    map(v => v[1]),
  );


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private loader: LoadingBarService,
    private authService: AuthService,
    private userIdleService: UserIdleService,
    private toastr: ToastrService,
  ) {

  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.userIdleService.startWatching();
      this.userIdleService
        .onTimerStart()
        // .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
      this.userIdleService
        .onTimeout()
        // .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          // alert('Your session has timed out. Please log in again.');
          this.toastr.info("idle detected !!!")
          console.log('Your session has timed out. Please log in again.');
          // this.authenticationService.logout();
          this.userIdleService.resetTimer();
        });
    }
  }

}
