import {Component} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from "@angular/router";
import 'rxjs/add/operator/filter';
import {GlobalState} from "../../../global.state";

@Component({
  selector: 'ba-content-top',
  styles: [require('./baContentTop.scss')],
  template: require('./baContentTop.html'),
})
export class BaContentTop {

  public activePageTitle:string = '';
/*
  constructor(private _state:GlobalState) {
    this._state.subscribe('menu.activeLink', (activeLink) => {
      if (activeLink) {
        this.activePageTitle = activeLink.title;
      }
    });
  }*/
  breadcrumbs: Array<Object>;
  constructor(private _state:GlobalState, private router:Router, private route:ActivatedRoute) {
    this._state.subscribe('menu.activeLink', (activeLink) => {
      if (activeLink) {
        this.activePageTitle = activeLink.title;
      }
    });
  }
  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(event => {  // note, we don't use event
        this.breadcrumbs = [];
        let currentRoute = this.route.root,
          url = '';
        do {
          let childrenRoutes = currentRoute.children;
          currentRoute = null;
          childrenRoutes.forEach(route => {
            if(route.outlet === 'primary') {
              let routeSnapshot = route.snapshot;
              url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');
              let label = route.snapshot.data['breadcrumb'];
              if (label) {
                this.breadcrumbs.push({
                  label: label,
                  url:   url });
              }
              currentRoute = route;
            }
          })
        } while(currentRoute);
      })
  }
}
