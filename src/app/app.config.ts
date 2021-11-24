declare const fetch: Function

export class AppConfig {
  static KEYCLOAK_JSON: string;
  static ENDORSEMENT_BASE_PATH: string;
  static IR_BASE_PATH: string;
  static SR_BASE_PATH: string;
  static ENVIRONMENT_TEXT: string;
  static IDP_NAMESPACE: string;

  public static _initialize() {
    return fetch('/assets/config.json')
      .then(response => response.json())
      .then( config => {
        AppConfig.IR_BASE_PATH = config.irBasePath
        AppConfig.SR_BASE_PATH = config.srBasePath
        AppConfig.ENDORSEMENT_BASE_PATH = config.endorsementBasePath
        AppConfig.KEYCLOAK_JSON = config.keycloakJson
        AppConfig.ENVIRONMENT_TEXT = config.environmentText
        AppConfig.IDP_NAMESPACE = config.idpNamespace
        return;
      })
      .catch(function (error) { 
        console.log("No config.json file could be loaded: " + error); 
        AppConfig.IR_BASE_PATH = IR_BASE_PATH
        AppConfig.SR_BASE_PATH = SR_BASE_PATH
        AppConfig.ENDORSEMENT_BASE_PATH = ENDORSEMENT_BASE_PATH;
        AppConfig.KEYCLOAK_JSON = KEYCLOAK_JSON;
        AppConfig.ENVIRONMENT_TEXT = ENVIRONMENT_TEXT;
        AppConfig.IDP_NAMESPACE = IDP_NAMESPACE;
        return;
      });
  }
}
AppConfig._initialize();
