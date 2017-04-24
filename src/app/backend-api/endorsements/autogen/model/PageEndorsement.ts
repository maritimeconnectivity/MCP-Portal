/**
 * Maritime Cloud Endorsement API
 * Maritime Cloud Endorsement API can be used for endorsing services in the Maritime Cloud.
 *
 * OpenAPI spec version: 0.4.90
 * Contact: info@maritimecloud.net
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface PageEndorsement {
    content?: Array<models.Endorsement>;

    first?: boolean;

    last?: boolean;

    number?: number;

    numberOfElements?: number;

    size?: number;

    sort?: models.Sort;

    totalElements?: number;

    totalPages?: number;

}
