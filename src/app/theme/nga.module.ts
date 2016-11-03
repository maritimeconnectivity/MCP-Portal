import { NgModule, ModuleWithProviders }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  BaThemeConfig
} from './theme.config';

import {
  BaThemeConfigProvider
} from './theme.configProvider';

import {
  BaAmChart,
  BaBackTop,
  BaCard,
  BaChartistChart,
  BaCheckbox,
  BaContentTop,
  BaFullCalendar,
  BaMenuItem,
  BaMenu,
  BaMsgCenter,
  BaMultiCheckbox,
  BaPageTop,
  BaPictureUploader,
  BaSidebar
} from './components';

import { BaCardBlur } from './components/baCard/baCardBlur.directive';

import {
  BaScrollPosition,
  BaSlimScroll,
  BaThemeRun
} from './directives';

import {
  BaAppPicturePipe,
  BaKameleonPicturePipe,
  BaProfilePicturePipe,
  TruncatePipe,
  SanitizeHtmlPipe,
	UndefinedPipe
} from './pipes';

import {
  BaImageLoaderService,
  BaThemePreloader,
  BaThemeSpinner
} from './services';

import {
  EmailValidator,
  EqualPasswordsValidator
} from './validators';
import {FadingCircleComponent} from "./components/spinner/fading-circle";
import {McCreateButton} from "./components/mcCreateButton/mcCreateButton.component";
import {McLabelValueTable} from "./components/mcLabelValueTable/mcLabelValueTable.component";
import {McTable} from "./components/mcTable/mcTable.component";
import {McFileUploader} from "./components/mcFileUploader/mcFileUploader.component";
import {McLoadingButton} from "./components/mcLoadingButton/mcLoadingButton.component";
import {FadingCircleSmallComponent} from "./components/spinner/fading-circle-small";
import {McEntityImageList} from "./components/mcEntityImageList/mcEntityImageList.component";
import {McEntityImage} from "./components/mcEntityImage/mcEntityImage.component";
import {McFormControl} from "./components/mcFormControl/mcFormControl.component";
import {McForm} from "./components/mcForm/mcForm.component";

const NGA_COMPONENTS = [
  BaAmChart,
  BaBackTop,
  BaCard,
  BaChartistChart,
  BaCheckbox,
  BaContentTop,
  BaFullCalendar,
  BaMenuItem,
  BaMenu,
  BaMsgCenter,
  BaMultiCheckbox,
  BaPageTop,
  BaPictureUploader,
  BaSidebar,
  FadingCircleComponent,
  FadingCircleSmallComponent,
  McCreateButton,
  McLabelValueTable,
  McTable,
  McFileUploader,
  McLoadingButton,
	McEntityImageList,
	McEntityImage,
	McFormControl,
	McForm
];

const NGA_DIRECTIVES = [
  BaScrollPosition,
  BaSlimScroll,
  BaThemeRun,
  BaCardBlur
];

const NGA_PIPES = [
  BaAppPicturePipe,
  BaKameleonPicturePipe,
  BaProfilePicturePipe,
  TruncatePipe,
  SanitizeHtmlPipe,
	UndefinedPipe
];

const NGA_SERVICES = [
  BaImageLoaderService,
  BaThemePreloader,
  BaThemeSpinner
];

const NGA_VALIDATORS = [
  EmailValidator,
  EqualPasswordsValidator
];

@NgModule({
  declarations: [
    ...NGA_PIPES,
    ...NGA_DIRECTIVES,
    ...NGA_COMPONENTS
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    ...NGA_PIPES,
    ...NGA_DIRECTIVES,
    ...NGA_COMPONENTS
  ]
})
export class NgaModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders> {
      ngModule: NgaModule,
      providers: [
        BaThemeConfigProvider,
        BaThemeConfig,
        ...NGA_VALIDATORS,
        ...NGA_SERVICES
      ],
    };
  }
}
