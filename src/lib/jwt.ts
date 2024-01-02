import jsonwebtoken from 'jsonwebtoken';

import { workspace, company } from '@/models';
import { ICompanyModelWithId } from '@/models/company';
import { IUserModelWithId } from '@/models/user';
import { IWorkspaceModelWithId } from '@/models/workspace';

import { JWTDecodedOutput } from '@/interfaces/output';

export const generateJwtTokens = async ({
  user,
  workspaceId
}: {
  user: IUserModelWithId;
  workspaceId?: string;
}) => {
  const permissions: Record<string, string>[] = [];

  const workspaceItem = workspaceId
    ? await workspace.get<IWorkspaceModelWithId>(workspaceId)
    : undefined;

  const companyItem = workspaceItem?.companyId
    ? await company.get<ICompanyModelWithId>(workspaceItem.companyId.toString())
    : undefined;

  if (workspaceItem) {
    const member = workspaceItem?.members?.find((el: any) =>
      el.id.equals(user._id)
    );
    member?.permissions?.forEach((permission) => {
      permissions.push({
        entity: permission.entity ?? '',
        role: permission.role ?? ''
      });
    });
  }

  const accessToken = generateJwtToken({
    user,
    company: companyItem,
    workspace: workspaceItem,
    permissions,
    type: 'access'
  });
  const refreshToken = generateJwtToken({
    user,
    type: 'refresh'
  });

  return { accessToken, refreshToken };
};

export const generateJwtToken = ({
  user,
  company,
  workspace,
  permissions,
  type = 'access'
}: {
  user: IUserModelWithId;
  company?: ICompanyModelWithId;
  workspace?: IWorkspaceModelWithId;
  permissions?: Record<string, string>[];
  type: 'access' | 'refresh';
}) => {
  const payload: JWTDecodedOutput = {
    iss: 'displayeo',
    id: user._id.toString(),
    email: user.email?.toString() ?? '',
    permissions
  };

  if (company?._id) {
    payload.company = {
      id: company._id.toString(),
      owner: user._id.equals(company.ownerId ?? '')
    };
  }

  if (workspace?._id) {
    payload.workspace = {
      id: workspace._id.toString(),
      owner: user._id.equals(workspace.ownerId ?? '')
    };
  }

  const expiresIn = type === 'access' ? '1800s' : '7d';

  return jsonwebtoken.sign(
    payload,
    (type === 'access'
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET) ?? '',
    {
      expiresIn,
      algorithm: 'HS256'
    }
  );
};

export const authenticateToken = (
  authHeader?: string,
  type: 'access' | 'refresh' = 'access'
): JWTDecodedOutput | undefined => {
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return;
  }

  const payload = jsonwebtoken.verify(
    token,
    (type === 'access'
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET) ?? ''
  );

  return payload as JWTDecodedOutput;
};
