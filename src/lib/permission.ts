import { JWTDecodedOutput } from '@/interfaces/output';

export const checkJWTPermissions = ({
  jwt,
  entity,
  permissions,
  onlyCompanyOwner,
  onlyWorkspaceOwner
}: {
  jwt?: JWTDecodedOutput;
  entity?: string;
  permissions?: string[];
  onlyCompanyOwner?: boolean;
  onlyWorkspaceOwner?: boolean;
}) => {
  if (onlyCompanyOwner) {
    return jwt?.company?.owner === true;
  }

  if (onlyWorkspaceOwner) {
    return jwt?.company?.owner === true || jwt?.workspace?.owner === true;
  }

  const userEntityPermissions = jwt?.permissions?.find(
    (permission) => permission.entity === entity
  );

  const hasPermission =
    jwt &&
    userEntityPermissions &&
    permissions?.includes(userEntityPermissions.role);

  return (
    jwt?.company?.owner === true ||
    jwt?.workspace?.owner === true ||
    hasPermission === true
  );
};
