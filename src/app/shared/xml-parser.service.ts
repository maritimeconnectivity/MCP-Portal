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

      let innerXmlData = xmlData.getElementsByTagName(outerField)[0];
      return innerXmlData.getElementsByTagName(fieldToFind)[0].childNodes[0].nodeValue;
    } catch ( error ) {
      throw new Error("Error trying to parse required field: " + outerField + " -> " + fieldToFind);
    }
  }

  public getValueFromField(field:string, xml:Xml):string {
    try {
      var parser = new DOMParser();
      let xmlString =  xml.content;
      var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

      return xmlData.getElementsByTagName(field)[0].childNodes[0].nodeValue;
    } catch ( error ) {
      throw new Error("Error trying to parse required field: " + field);
    }
  }

}
