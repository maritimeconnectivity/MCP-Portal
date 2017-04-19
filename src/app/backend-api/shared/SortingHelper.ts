/**
 * Helper class for sorting strings. All sorting strings gathered one place for easy change in sorting priority without traversing the full code base
 */
export class SortingHelper {

	public static sortingForDevices() : Array<string> {
		return ['name'];
	}

	public static sortingForOrganizations() : Array<string> {
		return ['name'];
	}

	public static sortingForUsers() : Array<string> {
		return ['firstName', 'lastName'];
	}

	public static sortingForVessels() : Array<string> {
		return ['name'];
	}

	public static sortingForSpecifications() : Array<string> {
		return ['name', 'version'];
	}

	public static sortingForDesigns() : Array<string> {
		return ['name', 'version'];
	}

	public static sortingForInstances() : Array<string> {
		return ['name', 'version'];
	}
}
