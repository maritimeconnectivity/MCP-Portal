import {FormGroup} from '@angular/forms';

export class EqualPasswordsValidator {

  public static validate(firstField, secondField) {
    return (c:FormGroup) => {
      return (firstField.value == secondField.value) ? null : {
        passwordsEqual: {
          valid: false
        }
      };
    }
  }
}
