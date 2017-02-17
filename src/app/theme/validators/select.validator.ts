import {FormGroup, AbstractControl} from '@angular/forms';
const NOT_VALID = {
	validateUrl: {
		valid: false
	}
}
export class SelectValidator {
  public static validate(c:AbstractControl) {
	  if (!c.value || c.value.length == 0 || c.value.toLowerCase().indexOf('undefined') >= 0) {
		  return NOT_VALID;
	  } else {
	  	return null;
	  }
  }
}
