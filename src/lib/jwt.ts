import jsonwebtoken from 'jsonwebtoken';

import { IUserModelWithId } from '@/models/user';

import { IOutputWorkspacePermission, JWTDecodedOutput } from '@/interfaces/output';
import { IDeviceModelWithId } from '@/models/device';

export type WorkspacesPermissions = Record<string, IOutputWorkspacePermission[]>;

export const generateDeviceToken = ({
  device,
  type = 'access'
}: {
  device: IDeviceModelWithId;
  type: 'access' | 'refresh';
}) => {
  const payload: JWTDecodedOutput = {
    iss: 'batari',
    deviceId: device._id.toString()
  };

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

export const generateJwtTokens = async ({
  user
}: {
  user: IUserModelWithId;
  workspaceId?: string;
}) => {
  const accessToken = generateJwtToken({
    user,
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
  type = 'access'
}: {
  user: IUserModelWithId;
  workspace?: WorkspacesPermissions;
  type: 'access' | 'refresh';
}) => {
  const payload: JWTDecodedOutput = {
    iss: 'batari',
    id: user._id.toString(),
    name: user.name,
    email: user.email?.toString() ?? '',
    super: user.isAdmin
  };

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
