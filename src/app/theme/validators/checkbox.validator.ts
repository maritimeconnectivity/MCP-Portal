import {AbstractControl} from '@angular/forms';
const NOT_VALID = {
	validateCheck: {
		valid: false
	}
}
export class CheckboxValidator {
  public static validate(c:AbstractControl) {
	  if (!c.value) {
		  return NOT_VALID;
	  } else {
	  	return null;
	  }
  }
}
