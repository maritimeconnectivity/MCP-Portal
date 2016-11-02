export interface EnumKeyValue {
	key:any;
	value:any;
}


export class EnumsHelper {
	public static getKeysAndValuesFromEnum(myEnum:any):Array<EnumKeyValue> {
		let enumKeysAndValues:Array<EnumKeyValue> = [];
		let keysAndValues:Array<any> = [];
		for (let enumValue in myEnum) {
			let enumsKeysAndValuesLength = keysAndValues.length;

			if (enumsKeysAndValuesLength === 0) {
				keysAndValues.push([enumValue, myEnum[enumValue]]);
				enumKeysAndValues.push({key:enumValue, value: myEnum[enumValue]});
			} else {
				if (keysAndValues[enumsKeysAndValuesLength - 1][1] !== enumValue) {
					keysAndValues.push([enumValue, myEnum[enumValue]]);
					enumKeysAndValues.push({key:enumValue, value: myEnum[enumValue]});
				}
			}
		}
		return enumKeysAndValues;
	}
}
