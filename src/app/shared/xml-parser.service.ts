import {Injectable} from "@angular/core";
import {Xml} from "../backend-api/service-registry/autogen/model/Xml";
import {PortalUserError, UserError} from "./UserError";

@Injectable()
export class XmlParserService {
  constructor() {

  }

  public getVauleFromEmbeddedField(outerField:string, fieldToFind:string, xml:Xml) {
    try {
      var parser = new DOMParser();
      let xmlString =  xml.content;
      var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

	    let outerElement = xmlData.getElementsByTagName(outerField);
	    if (outerElement.length == 0) {
	    	let prefix = xmlData.documentElement.prefix;
	    	outerElement = xmlData.getElementsByTagName(prefix + ":" + outerField);
	    }

	    let innerXmlData = outerElement[0];
	    let innerElement = innerXmlData.getElementsByTagName(fieldToFind);
	    if (innerElement.length == 0) {
		    let prefix = xmlData.documentElement.prefix;
		    innerElement = innerXmlData.getElementsByTagName(prefix + ":" + fieldToFind);
	    }
      return innerElement[0].childNodes[0].nodeValue;
    } catch ( error ) {
      throw new PortalUserError("Error trying to parse required field: " + outerField + " -> " + fieldToFind, error);
    }
  }

	public getValueFromField(field:string, xml:Xml):string {
		try {
			var parser = new DOMParser();
			let xmlString =  xml.content;
			var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

			let innerElement = xmlData.getElementsByTagName(field);
			if (innerElement.length == 0) {
				let prefix = xmlData.documentElement.prefix;
				innerElement = xmlData.getElementsByTagName(prefix + ":" + field);
			}
			return innerElement[0].childNodes[0].nodeValue;
		} catch ( error ) {
			throw new PortalUserError("Error trying to parse required field: " + field);
		}
	}

	// Gets the value or returns empty string if field doesn't exist
	public getValueFromFieldOrEmptyString(field:string, xml:Xml):string {
		try {
			var parser = new DOMParser();
			let xmlString =  xml.content;
			var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

			let innerElement = xmlData.getElementsByTagName(field);
			if (innerElement.length == 0) {
				let prefix = xmlData.documentElement.prefix;
				innerElement = xmlData.getElementsByTagName(prefix + ":" + field);
			}
			if (innerElement.length == 0) {
				return '';
			}
			let value = innerElement[0].childNodes[0];
			if (!value) {
				return '';
			}
			return value.nodeValue;
		} catch ( error ) {
			throw new PortalUserError("Error trying to parse required field: " + field);
		}
	}

}
