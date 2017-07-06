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

		var areas = [];

		let coversAreasRoot = xmlData.getElementsByTagName('coversAreas')[0];

		if (coversAreasRoot) {
			let coversAreas = coversAreasRoot.getElementsByTagName('coversArea');

			if (coversAreas.length > 0) {
				for (let i = 0; i < coversAreas.length; i++) {
					let node = coversAreas[i].getElementsByTagName('geometryAsWKT')[0].childNodes[0];
					let area = null;
					if (node) {
						area = node.nodeValue.replace(/\s+\(\(/, '\(\(');
					} else {
						area = 'POLYGON((-180 90, 180 90, 180 -90, -180 -90))';
					}
					areas.push(area);
				}
			} else {
				areas.push('POLYGON((-180 90, 180 90, 180 -90, -180 -90))');
			}
		} else {
			areas.push('POLYGON((-180 90, 180 90, 180 -90, -180 -90))');
		}

		return areas;
	}
}
