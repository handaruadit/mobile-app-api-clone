/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />

import { InferSchemaType } from 'mongoose';
import type { Model } from 'mongoose';
import { ResolveSchemaOptions } from 'mongoose';
import { Schema } from 'mongoose';
import type { Types } from 'mongoose';

export declare enum Departments {
    MANAGEMENT = "MANAGEMENT",
    MARKETING = "MARKETING",
    OPERATIONS = "OPERATIONS",
    FINANCE = "FINANCE",
    SALES = "SALES",
    HR = "HR",
    IT = "IT",
    OTHER = "OTHER"
}

export declare enum Entities {
    WORKSPACE = "WORKSPACE",
    SCREENS = "SCREENS",
    CONTENT = "CONTENT",
    BILLING = "BILLING"
}

export declare enum ErrorCodes {
    COMPANY_NOT_FOUND = "CompanyNotFound",
    COMPANY_ALREADY_EXISTS = "CompanyAlreadyExists",
    USER_NOT_AUTHORIZED = "UserNotAuthorized",
    PASSWORD_NOT_MATCH = "PasswordNotMatch",
    PASSWORD_NOT_VALID = "PasswordNotValid",
    WORKSPACE_NOT_FOUND = "WorkspaceNotFound",
    WORKSPACE_NEW_OWNER_MEMBER = "NewOwnerMember",
    WORKSPACE_USER_ALREADY_OWNER = "UserAlreadyOwner",
    USER_NOT_FOUND = "UserNotFound",
    USER_NOT_FOUND_IN_WORKSPACE = "UserNotFoundInWorkspace",
    INVITATION_ALREADY_SENT = "InvitationAlreadySent",
    USER_ALREADY_IN_WORKSPACE = "UserAlreadyInWorkspace",
    USER_ALREADY_IN_OTHER_COMPANY = "UserAlreadyInOtherCompany",
    INVITATION_NOT_FOUND = "InvitationNotFound",
    EMAIL_ALREADY_EXISTS = "EmailAlreadyExists",
    LINK_NOT_VALID = "LinkNotValid",
    LINK_NOT_FOUND = "LinkNotFound",
    VALIDATION_ERROR = "ValidationError",
    DUPLICATE_KEY_ERROR = "DuplicateKeyError"
}

export declare type ICompanyModel = InferSchemaType<typeof schema>;

export declare type ICompanyModelOutput = StringIds<ICompanyModelWithId>;

export declare type ICompanyModelPayload = Omit<ICompanyModel, 'createdAt' | 'updatedAt'>;

export declare type ICompanyModelWithId = ICompanyModel & {
    _id: Types.ObjectId;
};

declare interface ICompanyOwner {
    id: string;
    name: string;
    email: string;
}

export declare enum Industries {
    EDUCATION = "EDUCATION",
    ENERGY = "ENERGY",
    EVENTS = "EVENTS",
    FINANCE = "FINANCE",
    FITNESS = "FITNESS",
    HEALTHCARE = "HEALTHCARE",
    RESTAURANT = "RESTAURANT",
    MANUFACTURING = "MANUFACTURING",
    MEDIA_ADVERSITING = "MEDIA_ADVERSITING",
    PLACES_WORKSHIP = "PLACES_WORKSHIP",
    REAL_STATE = "REAL_STATE",
    RETAIL = "RETAIL",
    SOFTWARE_SERVICES = "SOFTWARE_SERVICES",
    TELECOMMUNICATION = "TELECOMMUNICATION",
    TRANSPORTATION = "TRANSPORTATION",
    OTHER = "OTHER"
}

export declare interface InputProtectedUserPutBody {
    email: string;
    name?: string;
    job?: string;
    department?: Departments;
}

export declare interface IProtectedUserEntity {
    _id: Types.ObjectId | string;
    name?: string;
    email: string;
    createdAt: NativeDate | string;
    updatedAt: NativeDate | string;
    crispTokenId: string;
    job?: string;
    department?: Departments;
}

export declare type ITokenInvitationModel = InferSchemaType<typeof schema_2>;

export declare type ITokenInvitationModelOutput = StringIds<ITokenInvitationModelWithId>;

export declare type ITokenInvitationModelWithId = ITokenInvitationModel & {
    _id: Types.ObjectId;
};

export declare type ITokenModel = InferSchemaType<typeof schema_3>;

export declare type ITokenModelOutput = StringIds<ITokenModelWithId>;

export declare type ITokenModelWithId = ITokenModel & {
    _id: Types.ObjectId;
};

export declare type IUserModel = InferSchemaType<typeof schema_4>;

export declare type IUserModelOutput = StringIds<IUserModelWithId>;

export declare type IUserModelWithId = IUserModel & {
    _id: Types.ObjectId;
};

export declare type IWorkspaceModel = InferSchemaType<typeof schema_5>;

export declare type IWorkspaceModelOutput = StringIds<IWorkspaceModelWithId>;

export declare type IWorkspaceModelPayload = Omit<IWorkspaceModel, 'createdAt' | 'updatedAt' | 'members' | 'ownerId'> & {
    members?: IWorkspaceModel['members'];
    ownerId?: IWorkspaceModel['ownerId'];
};

export declare type IWorkspaceModelWithId = IWorkspaceModel & {
    _id: Types.ObjectId;
    _owner: Pick<IUserModelWithId, '_id' | 'name' | 'email'>;
    _members: (Pick<IUserModelWithId, '_id' | 'name' | 'email'> & {
        permissions?: Record<string, string>[];
    })[];
};

export declare interface JWTDecodedOutput {
    iss?: string;
    id: string;
    email: string;
    company?: {
        id: string;
        owner: boolean;
    };
    workspace?: {
        id: string;
        owner: boolean;
    };
    permissions?: Record<string, string>[];
}

export declare interface OutputError {
    error: {
        code: ErrorCodes;
        payload?: any;
    };
}

export declare interface OutputProtectedCompanyDelete {
    code: ReturnCodes;
}

export declare interface OutputProtectedCompanyList {
    company: ICompanyModelOutput;
}

export declare interface OutputProtectedCompanyPost {
    company: ICompanyModelOutput;
}

export declare interface OutputProtectedCompanyPut {
    company: ICompanyModelOutput;
}

export declare interface OutputProtectedRefreshPost {
    tokens: OutputTokens;
}

export declare interface OutputProtectedUserList {
    user: IProtectedUserEntity;
}

export declare interface OutputProtectedUserPut {
    user: IProtectedUserEntity;
}

export declare interface OutputProtectedWorkspaceDelete {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceGet {
    workspace: IWorkspaceModelOutput & {
        invitations: ITokenInvitationModelOutput[];
        _companyOwner: ICompanyOwner;
    };
}

export declare interface OutputProtectedWorkspaceInvitationDelete {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceInvitationList {
    tokens: ITokenInvitationModelOutput[];
}

export declare interface OutputProtectedWorkspaceInvitationPut {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceInvitationResendPut {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceList {
    workspaces: (IWorkspaceModelOutput & {
        invitationCount: number;
        companyNames?: string;
    })[];
}

export declare interface OutputProtectedWorkspacePost {
    workspace: IWorkspaceModelOutput;
}

export declare interface OutputProtectedWorkspacePut {
    workspace: IWorkspaceModelOutput;
}

export declare interface OutputProtectedWorkspaceSwitchPut {
    tokens: OutputTokens;
}

export declare interface OutputProtectedWorkspaceUserDelete {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceUserPost {
    code: ReturnCodes;
}

export declare interface OutputProtectedWorkspaceUserPut {
    code: ReturnCodes;
}

export declare interface OutputPublicForgot {
    code: ReturnCodes;
}

export declare interface OutputPublicInvitationGet {
    userEmail: string;
    company: string;
    workspace: string;
}

export declare interface OutputPublicInvitationPost {
    tokens: OutputTokens;
}

export declare interface OutputPublicLoginPost {
    tokens: OutputTokens;
}

export declare type OutputPublicResetGet = {
    token: string;
    expireAt: Date;
};

export declare interface OutputPublicResetPost {
    code: ReturnCodes;
}

export declare interface OutputPublicSignupPost {
    tokens: OutputTokens;
}

export declare interface OutputRunnerWorkspaceGet {
    workspace: IWorkspaceModelOutput;
}

export declare interface OutputTokens {
    accessToken: string;
    refreshToken: string;
}

export declare enum ReturnCodes {
    COMPANY_DELETED = "CompanyDeleted",
    WORKSPACE_DELETED = "WorkspaceDeleted",
    INVITATION_SENT = "InvitationSent",
    USER_ADDED = "UserAdded",
    PERMISSIONS_UPDATED = "PermissionsUpdated",
    USER_REMOVED = "UserRemoved",
    INVITATION_DELETED = "InvitationDeleted",
    EMAIL_SENT = "EmailSent",
    PASSWORD_RESET = "PasswordReset",
    OWNER_CHANGED = "OwnerChanged"
}

export declare enum Roles {
    ADMIN = "ADMIN",
    WRITE = "WRITE",
    READ = "READ",
    NONE = "NONE"
}

declare const schema: Schema<any, Model<any, any, any, any, any>, {}, {}, {}, {}, ResolveSchemaOptions<    {
timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    country: string;
    ownerId: Types.ObjectId;
    industry?: Industries | undefined;
}>;

declare const schema_2: Schema<any, Model<any, any, any, any, any>, {}, {}, {}, {}, ResolveSchemaOptions<    {
timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expireAt: Date;
    token: string;
    userEmail: string;
    workspaceId: Types.ObjectId;
    permissions: {
        role?: Roles | undefined;
        entity?: Entities | undefined;
    }[];
}>;

declare const schema_3: Schema<any, Model<any, any, any, any, any>, {}, {}, {}, {}, ResolveSchemaOptions<    {
timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    expireAt: Date;
    userId: Types.ObjectId;
    token: string;
}>;

declare const schema_4: Schema<any, Model<any, any, any, any, any>, {}, {}, {}, {}, ResolveSchemaOptions<    {
timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    password: string;
    email: string;
    crispTokenId: string;
    name?: string | undefined;
    job?: string | undefined;
    department?: Departments | undefined;
}>;

declare const schema_5: Schema<any, Model<any, any, any, any, any>, {}, {}, {}, {}, ResolveSchemaOptions<    {
timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    ownerId: Types.ObjectId;
    isDefault: boolean;
    language: string;
    timezone: string;
    companyId: Types.ObjectId;
    members: {
        id: Types.ObjectId;
        permissions: {
            role?: Roles | undefined;
            entity?: Entities | undefined;
        }[];
    }[];
}>;

export declare type StringIds<T> = T extends Types.ObjectId ? string : T extends Record<any, any> ? {
    [K in keyof T]: StringIds<T[K]>;
} : T;

export declare enum ValidationErrorCodes {
    NAME_TOO_SHORT = "NameTooShort",
    EMAIL_IS_REQUIRED = "EmailIsRequired",
    INVALID_EMAIL_ADDRESS = "InvalidEmailAddress",
    PASSWORD_REQUIRED = "PasswordRequired",
    PASSWORD_TOO_SHORT = "PasswordTooShort",
    LANGUAGE_REQUIRED = "LanguageRequired",
    DEFAULT_REQUIRED = "DefaultRequired",
    OWNER_REQUIRED = "OwnerRequired",
    TIMEZONE_REQUIRED = "TimezoneRequired",
    COMPANY_REQUIRED = "CompanyRequired",
    INVALID_OWNER = "InvalidOwner",
    INVALID_COMPANY = "InvalidCompany",
    MEMBER_ID_REQUIRED = "MemberIdRequired",
    INVALID_MEMBER_ID = "InvalidMemberId",
    INVALID_ROLE = "InvalidRole",
    INVALID_WORKSPACE_ID = "InvalidWorkspaceId",
    TOKEN_ALREADY_EXISTS = "TokenAlreadyExists",
    TOKEN_IS_REQUIRED = "TokenIsRequired",
    INVALID_USER_ID = "InvalidUserId",
    INVALID_DEPARTMENT = "InvalidDepartment",
    JOB_TOO_SHORT = "JobTooShort",
    NAME_IS_REQUIRED = "NameIsRequired",
    COUNTRY_IS_REQUIRED = "CountryIsRequired",
    INVALID_INDUSTRY = "InvalidIndustry",
    COUNTRY_TOO_SHORT = "CountryTooShort",
    OWNER_ID_IS_REQUIRED = "OwnerIdIsRequired",
    INVALID_COMPANY_ID = "InvalidCompanyId",
    INVALID_ENTITY = "InvalidEntity",
    WORKSPACE_IS_REQUIRED = "WorkspaceIsRequired",
    USER_ID_IS_REQUIRED = "UserIdIsRequired"
}

export { }
