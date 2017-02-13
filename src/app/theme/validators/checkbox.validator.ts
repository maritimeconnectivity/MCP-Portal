import {AbstractControl} from '@angular/forms';
const NOT_VALID = {
	validateCheck: {
		valid: false
	}
}
export class CheckboxValidator {
  public static validate(c:AbstractControl) {
  	console.log("VVVVVV: ",c);
	  if (!c.value) {
		  return NOT_VALID;
	  } else {
	  	return null;
	  }
  }
}
