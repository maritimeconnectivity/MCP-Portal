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

	public getGeometryAsWKT(xml: Xml): string { // TODO: should get all WKTs instead of only first one
		let coversArea = this.xmlParserService.getVauleFromEmbeddedField('coversAreas', 'coversArea', xml);
		return this.xmlParserService.getValueFromField('geometryAsWKT', coversArea);
	}
}
