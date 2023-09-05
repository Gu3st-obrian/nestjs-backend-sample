export enum ROLES {
    /**
     * Allow User to get all roles list.
     */
     GetRolesAsAdmin = 'GetRolesAsAdmin',
    /**
     * Allow user to see this list.
     */
    GetRoles = 'GetRoles',

    /**
     * Allow user to operate as system.
     */
    OperateAsSystem = 'OperateAsSystem',
    /**
     * Allow user to operate as provider.
     */
    OperateAsProvider = 'OperateAsProvider',
    /**
     * Allow user to operate as network.
     */
    OperateAsNetwork = 'OperateAsNetwork',
    /**
     * Allow user to operate as client.
     */
    OperateAsClient = 'OperateAsClient',

    /**
     * Define if user are able to login.
     */
    UserCanLogin = 'UserCanLogin',

    /**
     * Give access to all wallet operations
     */
    GetWalletOperations = 'GetWalletOperations',
    /**
     * Give access to wallet balance.
     */
    GetWalletBalances = 'GetWalletBalances',


    /**
     * Authorization to create admin user.
     */
    CreateUserAdmin = 'CreateUserAdmin',
    /**
     * Authorization to get admin user info.
     */
    GetUserAdmin = 'GetUserAdmin',
    /**
     * Authorization to update admin user info.
     */
    UpdateUserAdmin = 'UpdateUserAdmin',
    /**
     * Authorization to delete admin user.
     */
    DeleteUserAdmin = 'DeleteUserAdmin',

    /**
     * Authorization to create simple user.
     */
    CreateUser = 'CreateUser',
    /**
     * Authorization to get simple user info.
     */
    GetUser = 'GetUser',
    /**
     * Authorization to update simple user.
     */
    UpdateUser = 'UpdateUser',
    /**
     * Authorization to delete simple user.
     */
    DeleteUser = 'DeleteUser',

    /**
     * Operate as admin user.
     */
     IsAdminUser = 'IsAdminUser',
    /**
     * Operate as simple user
     */
     IsSimpleUser = 'IsSimpleUser', 
};
