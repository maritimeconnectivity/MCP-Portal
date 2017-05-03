import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";

const EQUAL_STRING = ':';
enum QueryOperatorString {
	AND = <any> ' AND ',
	OR = <any> ' OR '
}
enum QueryParameterString {
	designId = <any> ('designId'+EQUAL_STRING),
	specificationId = <any> ('specificationId'+EQUAL_STRING),
	organizationId = <any> ('organizationId'+EQUAL_STRING),
	keywords = <any> ('keywords'+EQUAL_STRING),
	version = <any> ('version'+EQUAL_STRING)
}
export class QueryHelper {

	public static generateQueryStringForRequest(searchRequest: ServiceRegistrySearchRequest): string {
		if (!searchRequest) {
			return '*';
		}
		var queryString = '';
		var parameterAdded = false;
		if (searchRequest.keywords && searchRequest.keywords.length > 0) {
			queryString += QueryParameterString.keywords + "(" + QueryHelper.escapeQueryString(searchRequest.keywords) + ")";
			parameterAdded = true;
		}
		if (searchRequest.registeredBy && searchRequest.registeredBy.length > 0) {
			if (parameterAdded) {
				queryString += QueryOperatorString.AND;
			}
			queryString += QueryParameterString.organizationId + QueryHelper.escapeQueryString(searchRequest.registeredBy);
		}
		return queryString.length > 0 ? queryString : '*';
	}

	public static generateQueryStringForDesign(designId: string, version?: string): string {
		var queryString: string;

		let versionQuery = '';
		if (version) {
			versionQuery = QueryOperatorString.AND + QueryParameterString.version + QueryHelper.escapeQueryString(version);
		}
		queryString = QueryParameterString.designId + QueryHelper.escapeQueryString(designId) + versionQuery;

		return queryString;
	}

	public static generateQueryStringForSpecification(specificationId: string, version?: string): string {
		var queryString: string;

		let versionQuery = '';
		if (version) {
			versionQuery = QueryOperatorString.AND + QueryParameterString.version + QueryHelper.escapeQueryString(version);
		}
		queryString = QueryParameterString.specificationId + QueryHelper.escapeQueryString(specificationId) + versionQuery;

		return queryString;
	}

	public static combineQueryStringsWithAnd(queryStrings: Array<string>): string {
		var queryString = '';
		for (let i = 0; i < queryStrings.length; i++) {
			queryString += '(' + queryStrings[i] + ')';
			if (i != queryStrings.length - 1) {
				queryString += QueryOperatorString.AND;
			}
		}
		return queryString;
	}

	public static escapeQueryString(queryString: string): string {
		return queryString.replace(/\:/g, '\\:').replace(/\*/g, '\\*');
	}
}