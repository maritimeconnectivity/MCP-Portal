export class ServerUnreachableError {
	message: string;
	constructor() {
		this.message = "Server unreachable.\n\nTry again later.";
	}
}