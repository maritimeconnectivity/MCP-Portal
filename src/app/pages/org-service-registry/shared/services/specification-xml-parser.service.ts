import {Injectable} from '@angular/core';
import {ServiceRegistryXmlParser} from "./service-registry-xml-parser.service";
import {XmlParserService} from "../../../../shared/xml-parser.service";

@Injectable()
export class SpecificationXmlParser extends ServiceRegistryXmlParser {

	constructor(xmlParserService: XmlParserService) {
		super(xmlParserService);
	}
}
