import { Injectable } from '@angular/core';
import { XmlParserService } from "../../../../shared/xml-parser.service";
import { ServiceRegistryXmlParser } from "./service-registry-xml-parser.service";
import { Xml } from "../../../../backend-api/service-registry/autogen/model/Xml";

@Injectable()
export class DesignXmlParser extends ServiceRegistryXmlParser {

	constructor(xmlParserService: XmlParserService) {
		super(xmlParserService);
	}

	public getMrnForSpecificationInDesign(xml: Xml): string {
		// Because there has been no validation from the SR when creating designs, there are cases where designsServiceSpecifications is created as designServiceSpecifications (without an extra s). To accommodate this we first try to parse the wrong field and if this goes bad, we parse the right field. The reason to parse the right field last, is because then we get the right error message if both don't exists
		try {
			return this.xmlParserService.getVauleFromEmbeddedField('designServiceSpecifications', 'id', xml);
		} catch (err) {
			return this.xmlParserService.getVauleFromEmbeddedField('designsServiceSpecifications', 'id', xml);
		}
	}

	public getVersionForSpecificationInDesign(xml: Xml): string {
		// See the method getMrnForSpecificationInDesign for explaning why we do this.
		try {
			return this.xmlParserService.getVauleFromEmbeddedField('designServiceSpecifications', 'version', xml);
		} catch (err) {
			return this.xmlParserService.getVauleFromEmbeddedField('designsServiceSpecifications', 'version', xml);
		}
	}
}
