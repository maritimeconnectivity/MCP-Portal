export var PAGES_MENU_ALL = [
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
        path: 'organizations',
        data: {
          menu: {
            title: 'Organizations',
            icon: 'ion-ios-people',
            selected: false,
            expanded: false,
            order: 1
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
	        /*{
		        path: 'services',
		        data: {
			        menu: {
				        title: 'Services',
			        }
		        }
	        },*/
	        {
		        path: 'users',
		        data: {
			        menu: {
				        title: 'Users',
			        }
		        }
	        },
	        {
		        path: 'vessels',
		        data: {
			        menu: {
				        title: 'Vessels',
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
		        path: 'howto',
		        data: {
			        menu: {
				        title: 'How To?',
			        }
		        }
	        },
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
          },
          {
            path: 'instances',
            data: {
              menu: {
                title: 'Instances',
              }
            }
          }
        ]
      },
	    {
		    path: '',
		    data: {
			    menu: {
				    title: 'Report Bug',
				    icon: 'ion-bug',
				    url: '/#/report',
				    order: 600
			    }
		    }
	    },
	    {
		    path: '',
		    data: {
			    menu: {
				    title: 'User Guide',
				    url: 'http://manual.maritimecloud.net',
				    icon: 'ion-help',
				    order: 700,
				    target: '_blank'
			    }
		    }
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

export var PAGES_MENU_STM = [
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
				path: 'organizations',
				data: {
					menu: {
						title: 'Organizations',
						icon: 'ion-ios-people',
						selected: false,
						expanded: false,
						order: 1
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
						path: 'users',
						data: {
							menu: {
								title: 'Users',
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
						path: 'howto',
						data: {
							menu: {
								title: 'How To?',
							}
						}
					},
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
					},
					{
						path: 'instances',
						data: {
							menu: {
								title: 'Instances',
							}
						}
					}
				]
			},
			{
				path: '',
				data: {
					menu: {
						title: 'Report Bug',
						icon: 'ion-bug',
						url: '/#/report',
						order: 600
					}
				}
			},
			{
				path: '',
				data: {
					menu: {
						title: 'User Guide',
						url: 'http://manual.maritimecloud.net',
						icon: 'ion-help',
						order: 700,
						target: '_blank'
					}
				}
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

