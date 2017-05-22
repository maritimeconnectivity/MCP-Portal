import {Injectable} from "@angular/core";
import {Xml} from "../backend-api/service-registry/autogen/model/Xml";

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
      throw new Error("Error trying to parse required field: " + outerField + " -> " + fieldToFind);
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
      throw new Error("Error trying to parse required field: " + field);
    }
  }

}
