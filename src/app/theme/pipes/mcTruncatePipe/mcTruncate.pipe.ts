
import {Pipe} from "@angular/core/src/metadata/directives";
import {PipeTransform} from "@angular/core";
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value:string, limit?:any, trail?:string):string {
    let valueLimit = parseInt(limit || 10, 10);
    let valueTrail = trail || '...';
    return value.length > valueLimit ? value.substring(0, valueLimit) + valueTrail : value;
  }
  }
