import {PipeTransform} from "@angular/core";
import {Pipe} from "@angular/core/src/metadata/directives";
@Pipe({
  name: 'undefined'
})
export class UndefinedPipe implements PipeTransform  {

  constructor(){}

  transform(v?: string) : string {
    return (v?(v.toLowerCase()==='null' ? '' : v):(''));
  }
}
