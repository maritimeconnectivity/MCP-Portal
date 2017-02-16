/**
 * Maritime Cloud Identity Registry API
 * Maritime Cloud Identity Registry API can be used for managing entities in the Maritime Cloud.
 *
 * OpenAPI spec version: 0.0.1
 * Contact: info@maritimecloud.net
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface CertificateRevocation {
    /**
     * The reason the certificates has been revoked
     */
    revokationReason: CertificateRevocation.RevokationReasonEnum;

    /**
     * The date the certificate revocation should be activated.
     */
    revokedAt: string;

}
export namespace CertificateRevocation {
    export enum RevokationReasonEnum {
        Unspecified = <any> 'unspecified',
        Keycompromise = <any> 'keycompromise',
        Cacompromise = <any> 'cacompromise',
        Affiliationchanged = <any> 'affiliationchanged',
        Superseded = <any> 'superseded',
        Cessationofoperation = <any> 'cessationofoperation',
        Certificatehold = <any> 'certificatehold',
        Removefromcrl = <any> 'removefromcrl',
        Privilegewithdrawn = <any> 'privilegewithdrawn',
        Aacompromise = <any> 'aacompromise'
    }
}
