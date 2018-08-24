import { EnumsHelper } from '../../../../shared/enums-helper';
import { Role } from '../../../../backend-api/identity-registry/autogen/model/Role';
import RoleNameEnum = Role.RoleNameEnum;

export interface RoleNameViewModel {
    value?: string;
    label?: string;
}

export class RoleViewModel {
    public static getAllRoleNames(): Array<RoleNameViewModel> {
        let models: Array<RoleNameViewModel> = [];

        let keysAndValues = EnumsHelper.getKeysAndValuesFromEnum(RoleNameEnum);
        keysAndValues.forEach(enumKeyAndValue => {
           let model: RoleNameViewModel = {};
           if (enumKeyAndValue.value != RoleNameEnum.APPROVEORG && enumKeyAndValue.value != RoleNameEnum.SITEADMIN) {
               model.value = enumKeyAndValue.value;
               model.label = RoleViewModel.getLabelForEnum(enumKeyAndValue.value);
               models.push(model);
           }
        });
        return models;
    }

    public static getLabelForEnum(roleNameEnum: RoleNameEnum): string {
        if (!roleNameEnum) {
            return '';
        }
        let text = '';
        switch (roleNameEnum) {
            case RoleNameEnum.ORGADMIN: {
                text = 'Org Admin';
                break;
            }
            case RoleNameEnum.ENTITYADMIN: {
                text = 'Entity Admin';
                break;
            }
            case RoleNameEnum.SERVICEADMIN: {
                text = 'Service Admin';
                break;
            }
            case RoleNameEnum.USER: {
                text = 'User';
                break;
            }
            case RoleNameEnum.USERADMIN: {
                text = 'User Admin';
                break;
            }
            case RoleNameEnum.VESSELADMIN: {
                text = 'Vessel Admin';
                break;
            }
            case RoleNameEnum.DEVICEADMIN: {
                text = 'Device Admin';
                break;
            }
            case RoleNameEnum.APPROVEORG: {
                text = 'Approve Org Admin';
                break;
            }
            case RoleNameEnum.SITEADMIN: {
                text = 'Site Admin';
                break;
            }
            default: {
                text = '';
                break;
            }
        }
        return text;
    }
}