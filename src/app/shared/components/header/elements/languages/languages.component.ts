import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavService } from '../../../../services/nav.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {

  public language: boolean = false;

  public languages: any[] = [
    { language: 'Français', code: 'fr', icon: 'fr' },
    { language: 'English', code: 'en', type: 'US', icon: 'us' },
    { language: 'Español', code: 'es', icon: 'es' },
    { language: 'Português', code: 'pt', type: 'BR', icon: 'pt' }
  ]

  public selectedLanguage: any = null;//{ language: 'English', code: 'en', type: 'US', icon: 'us' }

  constructor(
    public navServices: NavService,
    private translate: TranslateService,
    private toastr: ToastrService,
  ) { }
  // 
  ngOnInit() {
    this.selectedLanguage = this.languages[0]
  }

  changeLanguage(lang) {
    this.toastr.info("En cours de développement");
    return;
    this.translate.use(lang.code)
    this.selectedLanguage = lang;
  }

}
