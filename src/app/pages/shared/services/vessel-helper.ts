import { Vessel } from "../../../backend-api/identity-registry/autogen/model/Vessel";
import { VesselAttribute } from "../../../backend-api/identity-registry/autogen/model/VesselAttribute";
import AttributeNameEnum = VesselAttribute.AttributeNameEnum;

export class VesselHelper {

	public static isVesselAttEqualTo(vessel:Vessel, imoNumber:string, mmsiNumber:string) : boolean {
		imoNumber = imoNumber || '';
		mmsiNumber = mmsiNumber || '';
		return imoNumber === VesselHelper.getIMO(vessel) && mmsiNumber === VesselHelper.getMMSI(vessel);
	}

	public static labelForSelect(vessel:Vessel) : string {
		let imo = VesselHelper.getIMO(vessel);
		let mmsi = VesselHelper.getMMSI(vessel);
		return vessel.name + ", IMO:" + (imo.length == 0 ? ' - ' : imo) + ", MMSI:" + (mmsi.length == 0 ? ' - ' : mmsi);
	}

	// Returns empty string if no IMO exists for the vessel
	public static getIMO(vessel:Vessel) : string  {
		var imo = '';
		vessel.attributes.forEach(att => {
			if (att.attributeName === AttributeNameEnum.ImoNumber) {
				imo = att.attributeValue;
			}
		});
		return imo;
	}

	// Returns empty string if no MMSI exists for the vessel
	public static getMMSI(vessel:Vessel) : string  {
		var mmsi = '';
		vessel.attributes.forEach(att => {
			if (att.attributeName === AttributeNameEnum.MmsiNumber) {
				mmsi = att.attributeValue;
			}
		});
		return mmsi;
	}
}
