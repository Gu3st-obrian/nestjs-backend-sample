import { ROLES } from "./role/role.enum";

export const ResourceRoles = {
    "POST:/account/login": [
        ROLES.UserCanLogin
    ],
    "POST:/account/refresh/token": [
        ROLES.UserCanLogin
    ],
    "GET:/movement/wallet/:wallet/operations": [
        ROLES.GetWalletOperations
    ],
    "GET:/movement/wallet/:wallet/balance": [
        ROLES.GetWalletBalances
    ],
    "GET:/movement/account/balances": [
        ROLES.GetWalletBalances
    ],
    "GET:/role/allowed": [
        ROLES.GetRoles,
        ROLES.IsAdminUser,
    ],
    "GET:/role/restricted": [
        ROLES.GetRoles,
        ROLES.OperateAsSystem,
        ROLES.IsAdminUser,
    ],
};
