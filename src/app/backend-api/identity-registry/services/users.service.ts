import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {User} from "../autogen/model/User";
import {UsercontrollerApi} from "../autogen/api/UsercontrollerApi";

@Injectable()
export class UsersService implements OnInit {
  private chosenUser: User;
  constructor(private userApi: UsercontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }
	public createUser(orgMrn: string, user: User) : Observable<User> {
		return this.userApi.createUserUsingPOST(orgMrn, user);
	}

  public issueNewCertificate(userMrn:string) : Observable<PemCertificate> {
    return Observable.create(observer => {
      let orgMrn = this.authService.authState.orgMrn;
      this.userApi.newUserCertUsingGET(orgMrn, userMrn).subscribe(
        pemCertificate => {
          this.chosenUser = null; // We need to reload now we have a new certificate
          observer.next(pemCertificate);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
}
