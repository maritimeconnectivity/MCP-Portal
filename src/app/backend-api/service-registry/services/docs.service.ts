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

	public updateOrCreateDoc(doc:Doc) : Observable<Doc> {
		if (!doc) {
			return Observable.of(null);
		} else if (doc.id) { // If doc has an ID then it has already been created and needs only update
			return this.updateDoc(doc);
		} else {
			return this.createDoc(doc);
		}
	}

  public updateDoc(doc:Doc) : Observable<Doc> {
  	return this.docsApi.updateDocUsingPUT(doc);
  }

	public createDoc(doc:Doc) : Observable<Doc> {
		doc.comment = '';
		return this.docsApi.createDocUsingPOST(doc);
	}
}
