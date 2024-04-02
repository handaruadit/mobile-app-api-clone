import { JWTDecodedOutput } from '@/interfaces/output';

export const checkJWTPermissions = ({
  jwt,
  entity,
  permissions,
  onlyWorkspaceOwner
}: {
  jwt?: JWTDecodedOutput;
  entity?: string;
  permissions?: string[];
  onlyWorkspaceOwner?: boolean;
}) => {
  if (onlyWorkspaceOwner) {
    return jwt?.workspace?.owner === true;
  }

  const userEntityPermissions = jwt?.permissions?.find(
    (permission) => permission.entity === entity
  );

  const hasPermission =
    jwt &&
    userEntityPermissions &&
    permissions?.includes(userEntityPermissions.role);

  return (
    jwt?.workspace?.owner === true ||
    hasPermission === true
  );
};
