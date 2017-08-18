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

		let coversAreasRootElement = xmlData.getElementsByTagName('coversAreas');
		if (coversAreasRootElement.length == 0) {
			let prefix = xmlData.documentElement.prefix;
			coversAreasRootElement = xmlData.getElementsByTagName(prefix + ":" + 'coversAreas');
		}

		let coversAreasRoot = coversAreasRootElement[0];
		if (coversAreasRoot) {
			let coversAreasElement = coversAreasRoot.getElementsByTagName('coversArea');
			if (coversAreasElement.length == 0) {
				let prefix = xmlData.documentElement.prefix;
				coversAreasElement = coversAreasRoot.getElementsByTagName(prefix + ":" + 'coversArea');
			}
			let coversAreas = coversAreasElement;

			if (coversAreas.length > 0) {
				for (let i = 0; i < coversAreas.length; i++) {
					let area = null;

					try {
						let nodeElement = coversAreasRoot.getElementsByTagName('geometryAsWKT');
						if (nodeElement.length == 0) {
							let prefix = xmlData.documentElement.prefix;
							nodeElement = coversAreas[i].getElementsByTagName(prefix + ":" + 'geometryAsWKT');
						}

						let node = nodeElement[0].childNodes[0];
						if (node) {
							area = node.nodeValue.replace(/\s+\(\(/, '\(\(');
						} else {
							area = 'POLYGON((-180 90, 180 90, 180 -90, -180 -90))';
						}
					} catch (error) {
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
