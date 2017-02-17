import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {DocresourceApi} from "../autogen/api/DocresourceApi";
import {Doc} from "../autogen/model/Doc";


@Injectable()
export class DocsService implements OnInit {
  constructor(private docsApi: DocresourceApi, private authService: AuthService) {
  }

  ngOnInit() {

  }
// TODO how the ???
  public getDoc(/*???*/) : Observable<Doc> {
  //      return this.docsApi.getDocUsingGET(???)
	return null;
  }
}
