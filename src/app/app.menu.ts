export const SITE_ADMIN_SUB_MENU = {
	path: 'administration',
	data: {
		menu: {
			title: 'Administration',
			icon: 'ion-lock-combination',
			selected: false,
			expanded: false,
			order: 0
		}
	},
	children: [
		{
			path: 'approve',
			data: {
				menu: {
					title: 'Approve',
				}
			}
		}
	]
};
