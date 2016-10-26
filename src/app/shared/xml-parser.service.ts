import {Injectable} from "@angular/core";
import {Xml} from "../backend-api/service-registry/autogen/model/Xml";

@Injectable()
export class XmlParserService {
  constructor() {

  }

  public getValueFromField(field:string, xml:Xml):string {
    try {
      var parser = new DOMParser();
      // TODO: this should not be an array with the new version. so remove tostring
      let xmlString =  xml.content.toString();
      var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

      return xmlData.getElementsByTagName(field)[0].childNodes[0].nodeValue;
    } catch ( error ) {
      throw new Error("Error trying to parse required field: " + field);
    }
  }

}
