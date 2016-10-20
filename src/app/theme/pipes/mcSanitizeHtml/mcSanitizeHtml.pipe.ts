import {SafeHtml, DomSanitizer} from "@angular/platform-browser";
import {PipeTransform} from "@angular/core";
import {Pipe} from "@angular/core/src/metadata/directives";
@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform  {

  constructor(private _sanitizer: DomSanitizer){}

  transform(v: string) : SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
