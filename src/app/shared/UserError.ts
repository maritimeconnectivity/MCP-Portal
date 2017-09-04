export class UserError {
	errorMessage: string;
	message: string;
	originalError?: any;
	sendBugReport: boolean;

	constructor(errorMessage:string, originalError?:any) {
		this.errorMessage = errorMessage;
		this.message = errorMessage;
		this.originalError = originalError;
		this.sendBugReport = true;
	}
}

// Use this to indicate that it is a user error generated by the portal with no API interaction
export class PortalUserError extends UserError {
}