/*
 * Angular bootstraping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './app/environment';
import { bootloader } from '@angularclass/hmr';
/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app';
import {AuthService} from "./app/authentication/services/auth.service";
import { AppConfig } from './app/app.config';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {

  return AppConfig._initialize()
    .then(() => AuthService.init())
    .then(() => {
      const platform = platformBrowserDynamic();
      platform.bootstrapModule(AppModule);
    })
    .catch(err => console.error(err));
}

bootloader(main);
