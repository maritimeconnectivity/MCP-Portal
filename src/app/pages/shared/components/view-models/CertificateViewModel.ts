import {Certificate} from "../../../../backend-api/identity-registry/autogen/model/Certificate";
export interface CertificateViewModel extends Certificate {
  revokeReasonText?:string;
}
