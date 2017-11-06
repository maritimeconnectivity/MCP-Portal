import {FormGroup, AbstractControl} from '@angular/forms';
const NOT_VALID = {
	validateUrl: {
		valid: false
	}
}
export class SelectValidator {
  public static validate(c:AbstractControl) {
	  if (!c.value || c.value.length == 0 || SelectValidator.isUndefinedString(c)) {
		  return NOT_VALID;
	  } else {
	  	return null;
	  }
  }

  private static isUndefinedString(c:AbstractControl) : boolean {
  	if (c.value instanceof String) {
		  return c.value.toLowerCase().indexOf('undefined') >= 0;
	  } else {
  		return false;
	  }
  }
}
