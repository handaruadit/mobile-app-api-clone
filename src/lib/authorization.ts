import { IncomingHttpHeaders } from 'http';

import { user } from '@/models';
import { IUserModelWithId } from '@/models/user';
// import { IWorkspaceModelWithId } from '@/models/workspace';
// import { ICompanyModelWithId } from '@/types';

import { JWTDecodedOutput } from '@/interfaces/output';
// import { Entities, Roles } from '@/lib/enum';
import { authenticateToken } from '@/lib/jwt';

export const isAdmin = async (headers: IncomingHttpHeaders): Promise<[boolean, ITokenPayload | undefined]> => {
  // return !!headers['x-super'];
  const token = await isTokenValid(headers, 'access');
  return [(!!token && token.account.isAdmin) ?? false, token?.account];
};

export interface ITokenPayload extends IUserModelWithId {
  companyId?: string;
  workspaceId?: string;
}

export interface ITokenPayloadWithJwt {
  account: ITokenPayload;
  jwt: JWTDecodedOutput;
}

export const isTokenValid = async (
  headers: IncomingHttpHeaders,
  type: 'access' | 'refresh'
): Promise<ITokenPayloadWithJwt | undefined> => {
  const token = headers['authorization'];
  const payload = authenticateToken(token, type);
  if (!payload?.id) {
    return;
  }

  const acc = await user.get<IUserModelWithId>(payload.id);

  if (!acc) {
    return;
  }

  // const [companyOfuser] = await company.find<ICompanyModelWithId>({
  //   ownerId: acc._id
  // });

  // const [workspacesOfUser] = await workspace.find<IWorkspaceModelWithId>({
  //   $or: [
  //     { ownerId: acc._id },
  //     { companyId: companyOfuser?._id },
  //     {
  //       members: {
  //         $elemMatch: {
  //           id: acc._id,
  //           permissions: {
  //             $elemMatch: {
  //               entity: Entities.WORKSPACE,
  //               role: {
  //                 $in: [Roles.READ, Roles.WRITE, Roles.ADMIN]
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   ]
  // });

  const account = {
    ...acc,
    // companyId: workspacesOfUser?.companyId?.toString(),
    // workspaceId: workspacesOfUser?._id?.toString()
  };

  return { account, jwt: payload };
};
