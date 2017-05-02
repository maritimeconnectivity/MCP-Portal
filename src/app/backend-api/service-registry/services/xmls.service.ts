import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {Xml} from "../autogen/model/Xml";


@Injectable()
export class XmlsService implements OnInit {
  constructor(private xmlsApi: XmlresourceApi) {
  }

  ngOnInit() {

  }

	public updateOrCreateXml(xml:Xml) : Observable<Xml> {
		if (!xml) {
			return Observable.of(null);
		} else if (xml.id) { // If xml has an ID then it has already been created and needs only update
			return this.updateXml(xml);
		} else {
			return this.createXml(xml);
		}
	}

  public updateXml(xml:Xml) : Observable<Xml> {
  	return this.xmlsApi.updateXmlUsingPUT(xml);
  }

	public createXml(xml:Xml) : Observable<Xml> {
		xml.comment = '';
		return this.xmlsApi.createXmlUsingPOST(xml);
	}
}
