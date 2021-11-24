import { Component, OnInit } from '@angular/core';
import { NavigationHelperService } from "../shared/navigation-helper.service";
import { AppConfig } from '../app.config';

@Component({
  selector: 'about',
  styles: [require('./about.scss')],
  templateUrl: 'about.component.html'
})

export class AboutComponent implements OnInit {
	public environment = AppConfig.ENVIRONMENT_TEXT;
  constructor(private navigationHelper: NavigationHelperService) {
  }

  ngOnInit() {
  }

	public goBack() {
		this.navigationHelper.takeMeHome();
	}
}
