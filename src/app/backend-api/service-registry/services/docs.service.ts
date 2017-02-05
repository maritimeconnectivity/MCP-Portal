import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {AuthService} from "../../../authentication/services/auth.service";
import {TechnicaldesignresourceApi} from "../autogen/api/TechnicaldesignresourceApi";
import {Design} from "../autogen/model/Design";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {XmlParserService} from "../../../shared/xml-parser.service";
import {Instance} from "../autogen/model/Instance";
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
