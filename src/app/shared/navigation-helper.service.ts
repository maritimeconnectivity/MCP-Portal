import {Injectable} from "@angular/core";
import {PAGES_MENU} from "../pages/pages.menu";
import {Route, Router} from "@angular/router";

//TODO: I cannot for the love of #¤&#¤ find a way to get the url of a component and navigate to the url. Thus this helper class :-( But hey I then had to make a recursive function and who doesn't love that :-)

@Injectable()
export class NavigationHelperService {
  private path:string;
  constructor(private router: Router ) {
  }

  public navigateToOrgDesign(designId:string):void {
    this.path = '/' + designId;
    let pagesMenu = PAGES_MENU;
    this.generatePath('designs', pagesMenu[0]);

    this.router.navigate([this.path]);
  }

  public navigateToOrgSpecification(specificationId:string):void {
    this.path = '/' + specificationId;
    let pagesMenu = PAGES_MENU;
    this.generatePath('specifications', pagesMenu[0]);

    this.router.navigate([this.path]);
  }

  private generatePath(nameOfElement:string, route: Route):boolean {
    if (route.path === nameOfElement) {
      this.path = '/' + route.path + this.path;
      return true;
    }
    if (route.children && route.children.length > 0) {
      var found = false;
      route.children.forEach(routeChild => {
        if (this.generatePath(nameOfElement, routeChild)) {
          found = true;
        }
      });
      if (found) {
        this.path = '/' + route.path + this.path;
        return true;
      }
    }
    return false;
  }
}
