import {Injectable} from '@angular/core';
import {XmlParserService} from "../../../../shared/xml-parser.service";
import {ServiceRegistryXmlParser} from "./service-registry-xml-parser.service";
import {Xml} from "../../../../backend-api/service-registry/autogen/model/Xml";

@Injectable()
export class DesignXmlParser extends ServiceRegistryXmlParser {

	constructor(xmlParserService: XmlParserService) {
		super(xmlParserService);
	}

	public getMrnForSpecificationInDesign(xml: Xml): string {
		return this.xmlParserService.getVauleFromEmbeddedField('designsServiceSpecifications', 'id', xml);
	}

	public getVersionForSpecificationInDesign(xml: Xml): string {
		return this.xmlParserService.getVauleFromEmbeddedField('designsServiceSpecifications', 'version', xml);
	}
}
