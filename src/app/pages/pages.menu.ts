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
        path: 'ir',
        data: {
          menu: {
            title: 'Identity Registry',
            icon: 'ion-lock-combination',
            selected: false,
            expanded: true,
            order: 100,
          }
        },
        children: [
          {
            path: 'devices',
            data: {
              menu: {
                title: 'Devices',
              }
            }
          },
          {
            path: 'services',
            data: {
              menu: {
                title: 'Services',
              }
            }
          }
        ]
      },
      {
        path: 'sr',
        data: {
          menu: {
            title: 'Service Registry',
            icon: 'ion-social-buffer',
            selected: false,
            expanded: true,
            order: 100,
          }
        },
        children: [
          {
            path: 'specifications',
            data: {
              menu: {
                title: 'Specifications',
              }
            }
          },
          {
            path: 'designs',
            data: {
              menu: {
                title: 'Designs',
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
