import appsettings from './appsettings.json';

export const issuer = process.env.Auth0__Issuer_Domain || appsettings.issuer;
export const tokenUrl = process.env.Auth0__TokenUrl || appsettings.tokenUrl;

export const basePath = process.env.VIRTUAL_PATH || appsettings.virutal_path;

export const permissionsProperty = appsettings.jwtPermissionProperty;
export const adminPermission = appsettings.adminPermission;
