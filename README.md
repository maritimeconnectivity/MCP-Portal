# Maritime Connectivity Platform Management Portal (Currently under development)

This is the implementation of a management portal for managing the [Maritime Connectivity Platform](http://maritimeconnectivity.net) core components - The [Identity Registry](https://github.com/MaritimeCloud/IdentityRegistry) and the [Service Registry](https://github.com/MaritimeCloud/mc-serviceregistry). It is currently under active development and changes that are not backward compatible should be expected. It is under the Apache 2.0 License.

### Demo

[The portal is live in beta version](https://management.maritimeconnectivity.net)

### Build

If you don’t have any of these tools installed already, you will need to:

* Download and install git
* Download and install nodejs

Note: Make sure you have Node version >= 4.0 and NPM >= 3

Once you have those, you should install these globals with npm install --global:

* Webpack
```bash
npm install --global webpack
```

* Webpack-dev-server
```bash
npm install --global webpack-dev-server
```
* Typescript
```bash
npm install --global typescript@2.0.0
```

Then do the project install
```bash
npm install
```

Due to the dependency issue, you may reinstall the node-sass
```bash
npm uninstall node-sass
npm install node-sass
```

And run the server locally
```bash
npm start-<api-environment>
```

Now it can be reached at  http://localhost:3000

###License
[Apache 2.0](LICENSE.txt) license.

#### Note

The starting foundation of this project has been build from the ng2-admin theme from Akveo: https://github.com/akveo/ng2-admin
