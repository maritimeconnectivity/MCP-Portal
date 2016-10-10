export const PAGES_MENU = [
  {
    path: 'pages',
    children: [
      {
        path: 'my-organization',
        data: {
          menu: {
            title: 'My Organization',
            icon: 'ion-ios-people',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'org-service-registry',
        data: {
          menu: {
            title: 'Service Registry',
            icon: 'ion-social-buffer',
            selected: false,
            expanded: false,
            order: 100,
          }
        },
        children: [
          {
            path: 'org-specifications',
            data: {
              menu: {
                title: 'Specifications',
              }
            }
          }
        ]
      },
      {
        path: 'org-identity-registry',
        data: {
          menu: {
            title: 'Identity Registry',
            icon: 'ion-lock-combination',
            selected: false,
            expanded: false,
            order: 100,
          }
        },
        children: [
          {
            path: 'org-devices',
            data: {
              menu: {
                title: 'Devices',
              }
            }
          },
          {
            path: 'org-services',
            data: {
              menu: {
                title: 'Services',
              }
            }
          }
        ]
      },
      {
        path: '',
        data: {
          menu: {
            title: 'Maritime Cloud',
            url: 'http://maritimecloud.net',
            icon: 'ion-android-exit',
            order: 800,
            target: '_blank'
          }
        }
      }
    ]
  }
];
