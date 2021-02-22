import { Injectable } from '@angular/core';
import { XmlParserService } from "../../../../shared/xml-parser.service";
import { Xml } from "../../../../backend-api/service-registry/autogen/model/Xml";

@Injectable()
export class ServiceRegistryXmlParser {
	constructor(protected xmlParserService: XmlParserService) {
	}

	public getName(xml: Xml): string {
		return this.xmlParserService.getValueFromField('name', xml);
	}

	public getDescription(xml: Xml): string {
		return this.xmlParserService.getValueFromField('description', xml);
	}

	public getMrn(xml: Xml): string {
		return this.xmlParserService.getValueFromField('id', xml);
	}

	public getKeywords(xml: Xml): string {
		return this.xmlParserService.getValueFromField('keywords', xml);
	}

	public getStatus(xml: Xml): string {
		return this.xmlParserService.getValueFromField('status', xml);
	}

	public getVersion(xml: Xml): string {
		return this.xmlParserService.getValueFromField('version', xml);
	}
}
