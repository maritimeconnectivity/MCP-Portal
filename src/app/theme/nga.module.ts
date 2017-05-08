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
	SanitizeUrlPipe,
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
import {McFormControlText} from "./components/mcFormControlText/mcFormControlText.component";
import {McForm} from "./components/mcForm/mcForm.component";
import {McModal} from "./components/mcModal/mcModal.component";
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import {UrlValidator} from "./validators/url.validator";
import {McLogoUploader} from "./components/mcLogoUploader/mcLogoUploader.component";
import {McFormControlCheckbox} from "./components/mcFormControlCheckbox/mcFormControlCheckbox.component";
import {McFormControlSelect} from "./components/mcFormControlSelect/mcFormControlSelect.component";
import {SelectValidator} from "./validators/select.validator";
import {CheckboxValidator} from "./validators/checkbox.validator";
import {McFormControlDatepicker} from "./components/mcFormControlDatepicker/mcFormControlDatepicker.component";
import {CalendarModule} from "primeng/components/calendar/calendar";
import {McFormControlTextArea} from "./components/mcFormControlTextArea/mcFormControlTextArea.component";
import {McFormControlFileUpload} from "./components/mcFormControlFileUpload/mcFormControlFileUpload.component";
import {McEndorseButton} from "./components/mcEndorseButton/mcEndorseButton.component";

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
  BaSidebar,
  FadingCircleComponent,
  FadingCircleSmallComponent,
  McCreateButton,
  McLabelValueTable,
  McTable,
	McFileUploader,
	McLogoUploader,
  McLoadingButton,
	McEndorseButton,
	McEntityImageList,
	McEntityImage,
	McFormControlText,
	McFormControlTextArea,
	McFormControlFileUpload,
	McFormControlCheckbox,
	McFormControlSelect,
	McFormControlDatepicker,
	McForm,
	McModal
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
	SanitizeUrlPipe,
	UndefinedPipe
];

const NGA_SERVICES = [
  BaImageLoaderService,
  BaThemePreloader,
  BaThemeSpinner
];

const NGA_VALIDATORS = [
  EmailValidator,
  EqualPasswordsValidator,
	UrlValidator,
	SelectValidator,
	CheckboxValidator
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
	  ModalModule,
	  CalendarModule
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
