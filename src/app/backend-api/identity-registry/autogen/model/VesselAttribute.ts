/**
 * Maritime Cloud Identity Registry API
 * Maritime Cloud Identity Registry API can be used for managing entities in the Maritime Cloud.
 *
 * OpenAPI spec version: 0.4.90
 * Contact: info@maritimecloud.net
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface VesselAttribute {
    /**
     * Vessel attribute name
     */
    attributeName: VesselAttribute.AttributeNameEnum;

    /**
     * Vessel attribute value
     */
    attributeValue: string;

    createdAt?: Date;

    end?: Date;

    start?: Date;

    updatedAt?: Date;

}
export namespace VesselAttribute {
    export enum AttributeNameEnum {
        ImoNumber = <any> 'imo-number',
        MmsiNumber = <any> 'mmsi-number',
        Callsign = <any> 'callsign',
        Flagstate = <any> 'flagstate',
        AisClass = <any> 'ais-class',
        PortOfRegister = <any> 'port-of-register'
    }
}
