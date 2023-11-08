export type AppPermissionType = {
  name: string;
  key: string;
  actions: {
    [key: string]: string;
  };
  actionsArray: string[];
};

export type AppPermissionsType = {
  [key: string]: {
    name: string;
    key: string;
    permissions: {
      [key: string]: AppPermissionType;
    };
  };
};

export const PERMISSION = {
  PERMISSION_PROFILE: {
    CREATE: 'PERMISSION_PROFILE_CREATE',
    EDIT: 'PERMISSION_PROFILE_EDIT',
    DELETE: 'PERMISSION_PROFILE_DELETE',
    VIEW: 'PERMISSION_PROFILE_VIEW',
  },
  USERS: {
    EDIT: 'USERS_EDIT',
    VIEW: 'USERS_VIEW',
  },
};

export class AppPermissions {
  private static readonly permissions = {
    PERMISSION_PROFILE: {
      name: 'Permission Profile',
      key: 'PERMISSION_PROFILE',
      permissions: {
        PERMISSION_PROFILE_CREATE: {
          name: 'Create',
          key: 'PERMISSION_PROFILE_CREATE',
          actions: {},
          actionsArray: [],
        },
        PERMISSION_PROFILE_EDIT: {
          name: 'Edit',
          key: 'PERMISSION_PROFILE_EDIT',
          actions: {
            ALL: 'ALL',
            CREATED: 'CREATED',
          },
          actionsArray: ['ALL', 'CREATED'],
        },
        PERMISSION_PROFILE_DELETE: {
          name: 'Delete',
          key: 'PERMISSION_PROFILE_DELETE',
          actions: {
            ALL: 'ALL',
            CREATED: 'CREATED',
          },
          actionsArray: ['ALL', 'CREATED'],
        },
        PERMISSION_PROFILE_VIEW: {
          name: 'View',
          key: 'PERMISSION_PROFILE_VIEW',
          actions: {
            ALL: 'ALL',
            CREATED: 'CREATED',
          },
          actionsArray: ['ALL', 'CREATED'],
        },
      },
    },
    USERS: {
      name: 'Users',
      key: 'USERS',
      permissions: {
        USERS_EDIT: {
          name: 'Edit',
          key: 'USERS_EDIT',
          actions: {},
          actionsArray: [],
        },
        USERS_VIEW: {
          name: 'View',
          key: 'USERS_VIEW',
          actions: {
            ALL: 'ALL',
            ASSIGNED: 'ASSIGNED',
          },
          actionsArray: ['ALL', 'ASSIGNED'],
        },
      },
    },
  };

  static get object() {
    const permissions: AppPermissionsType = this.permissions;

    const values: { [key: string]: AppPermissionType } = {};
    Object.values(permissions).forEach((p) => {
      const permissions = p.permissions;

      Object.values(permissions).forEach((pp) => {
        values[pp.key] = pp;
      });
    });

    return values;
  }

  static get list() {
    const permissions: AppPermissionsType = this.permissions;
    return Object.values(permissions).map((p) => {
      return {
        name: p.name,
        key: p.key,
        permissions: Object.values(p.permissions).map((pp) => {
          return {
            ...pp,
            actions: undefined,
          };
        }),
      };
    });
  }
}
