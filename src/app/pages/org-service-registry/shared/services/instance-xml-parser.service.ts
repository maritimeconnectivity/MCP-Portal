import {Injectable} from '@angular/core';
import {XmlParserService} from "../../../../shared/xml-parser.service";
import {ServiceRegistryXmlParser} from "./service-registry-xml-parser.service";
import {Xml} from "../../../../backend-api/service-registry/autogen/model/Xml";

@Injectable()
export class InstanceXmlParser extends ServiceRegistryXmlParser {

	constructor(xmlParserService: XmlParserService) {
		super(xmlParserService);
	}

	public getVersionForDesignInInstance(xml: Xml): string {
		return this.xmlParserService.getVauleFromEmbeddedField('implementsServiceDesign', 'version', xml);
	}

	public getMrnForDesignInInstance(xml: Xml): string {
		return this.xmlParserService.getVauleFromEmbeddedField('implementsServiceDesign', 'id', xml);
	}

	public getEndpoint(xml: Xml): string {
		return this.xmlParserService.getValueFromField('URL', xml);
	}

	public getGeometriesAsWKT(xml: Xml): Array<string> {
		var parser = new DOMParser();
		let xmlString = xml.content.split('\+').join(''); // remove +
		var xmlData = parser.parseFromString(xmlString, xml.contentContentType);

		let coversAreasRoot = xmlData.getElementsByTagName('coversAreas')[0];
		let coversAreas = coversAreasRoot.getElementsByTagName('coversArea');

		var areas = [];
		for (let i = 0; i < coversAreas.length; i++) {
			let area = coversAreas[i].getElementsByTagName('geometryAsWKT')[0].childNodes[0].nodeValue.replace(/\s+\(\(/, '\(\(');
			areas.push(area);
		}

		return areas;
	}
}
