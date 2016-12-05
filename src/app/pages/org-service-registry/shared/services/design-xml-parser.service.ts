import {Injectable} from '@angular/core';
import {XmlParserService} from "../../../../shared/xml-parser.service";
import {ServiceRegistryXmlParser} from "./service-registry-xml-parser.service";

@Injectable()
export class DesignXmlParser extends ServiceRegistryXmlParser {

	constructor(xmlParserService: XmlParserService) {
		super(xmlParserService);
	}
}
