export enum Industries {
  EDUCATION = 'EDUCATION',
  ENERGY = 'ENERGY',
  EVENTS = 'EVENTS',
  FINANCE = 'FINANCE',
  FITNESS = 'FITNESS',
  HEALTHCARE = 'HEALTHCARE',
  RESTAURANT = 'RESTAURANT',
  MANUFACTURING = 'MANUFACTURING',
  MEDIA_ADVERSITING = 'MEDIA_ADVERSITING',
  PLACES_WORKSHIP = 'PLACES_WORKSHIP',
  REAL_STATE = 'REAL_STATE',
  RETAIL = 'RETAIL',
  SOFTWARE_SERVICES = 'SOFTWARE_SERVICES',
  TELECOMMUNICATION = 'TELECOMMUNICATION',
  TRANSPORTATION = 'TRANSPORTATION',
  OTHER = 'OTHER'
}

export enum Departments {
  MANAGEMENT = 'MANAGEMENT',
  MARKETING = 'MARKETING',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  SALES = 'SALES',
  HR = 'HR',
  IT = 'IT',
  OTHER = 'OTHER'
}

export enum Entities {
  WORKSPACE = 'WORKSPACE'
}

export enum Roles {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  READ = 'READ',
  NONE = 'NONE'
}

export enum ErrorCodes {
  COMPANY_NOT_FOUND = 'CompanyNotFound',
  COMPANY_ALREADY_EXISTS = 'CompanyAlreadyExists',
  DEVICE_NOT_FOUND = 'DeviceNotFound',
  GET_DEVICE_IP_INFORMATION_FAILED = 'FailedToGetUsersDeviceInformation',
  USER_NOT_AUTHORIZED = 'UserNotAuthorized',
  NOT_FOUND = 'NotFound',
  PASSWORD_NOT_MATCH = 'PasswordNotMatch',
  PASSWORD_NOT_VALID = 'PasswordNotValid',
  WORKSPACE_NOT_FOUND = 'WorkspaceNotFound',
  WORKSPACE_STILL_HAS_SOLAR_PANEL = 'WorkspaceStillHasSolarPanelInIt',
  WORKSPACE_NEW_OWNER_MEMBER = 'NewOwnerMember',
  WORKSPACE_USER_ALREADY_OWNER = 'UserAlreadyOwner',
  USER_ALREADY_EXISTS = 'UserAlreadyExist',
  USER_NOT_FOUND = 'UserNotFound',
  USER_NOT_FOUND_IN_WORKSPACE = 'UserNotFoundInWorkspace',
  INVITATION_ALREADY_SENT = 'InvitationAlreadySent',
  USER_ALREADY_IN_WORKSPACE = 'UserAlreadyInWorkspace',
  USER_ALREADY_IN_OTHER_COMPANY = 'UserAlreadyInOtherCompany',
  INVITATION_NOT_FOUND = 'InvitationNotFound',
  INVALID_REQUEST = 'InvalidRequest',
  INVALID_ID = 'InvalidId',
  EMAIL_ALREADY_EXISTS = 'EmailAlreadyExists',
  LINK_NOT_VALID = 'LinkNotValid',
  LINK_NOT_FOUND = 'LinkNotFound',
  VALIDATION_ERROR = 'ValidationError',
  DUPLICATE_KEY_ERROR = 'DuplicateKeyError'
}

export enum ValidationErrorCodes {
  NAME_TOO_SHORT = 'NameTooShort',
  EMAIL_IS_REQUIRED = 'EmailIsRequired',
  INVALID_EMAIL_ADDRESS = 'InvalidEmailAddress',
  PASSWORD_REQUIRED = 'PasswordRequired',
  PASSWORD_TOO_SHORT = 'PasswordTooShort',
  NAME_REQUIRED = 'NameRequired',
  LANGUAGE_REQUIRED = 'LanguageRequired',
  DEFAULT_REQUIRED = 'DefaultRequired',
  OWNER_REQUIRED = 'OwnerRequired',
  TIMEZONE_REQUIRED = 'TimezoneRequired',
  COMPANY_REQUIRED = 'CompanyRequired',
  INVALID_OWNER = 'InvalidOwner',
  INVALID_COMPANY = 'InvalidCompany',
  MEMBER_ID_REQUIRED = 'MemberIdRequired',
  INVALID_MEMBER_ID = 'InvalidMemberId',
  INVALID_ROLE = 'InvalidRole',
  INVALID_WORKSPACE_ID = 'InvalidWorkspaceId',
  TOKEN_ALREADY_EXISTS = 'TokenAlreadyExists',
  TOKEN_IS_REQUIRED = 'TokenIsRequired',
  INVALID_USER_ID = 'InvalidUserId',
  INVALID_DEPARTMENT = 'InvalidDepartment',
  JOB_TOO_SHORT = 'JobTooShort',
  NAME_IS_REQUIRED = 'NameIsRequired',
  COUNTRY_IS_REQUIRED = 'CountryIsRequired',
  INVALID_INDUSTRY = 'InvalidIndustry',
  COUNTRY_TOO_SHORT = 'CountryTooShort',
  OWNER_ID_IS_REQUIRED = 'OwnerIdIsRequired',
  INVALID_COMPANY_ID = 'InvalidCompanyId',
  INVALID_ENTITY = 'InvalidEntity',
  WORKSPACE_IS_REQUIRED = 'WorkspaceIsRequired',
  USER_ID_IS_REQUIRED = 'UserIdIsRequired',
  INVALID_PHONE_NUMBER = 'InvalidPhoneNumber',
  PHONE_NUMBER_REQUIRED = 'PhoneNumberRequired'
}

export enum ReturnCodes {
  COMPANY_DELETED = 'CompanyDeleted',
  DEVICE_DELETED = 'DeviceDeleted',
  DEVICE_PAIRED = 'DevicePaired',
  WORKSPACE_DELETED = 'WorkspaceDeleted',
  JOIN_REQUEST_SENT = 'JoinRequestSent',
  INVITATION_SENT = 'InvitationSent',
  INVALID_COORDINATES = 'InvalidCoordinates',
  USER_ADDED = 'UserAdded',
  USER_REMOVED = 'UserRemoved',
  PERMISSIONS_UPDATED = 'PermissionsUpdated',
  INVITATION_DELETED = 'InvitationDeleted',
  EMAIL_SENT = 'EmailSent',
  PASSWORD_RESET = 'PasswordReset',
  PASSWORD_NOT_LONG_ENOUGH = 'PasswordNotLongEnough',
  OWNER_CHANGED = 'OwnerChanged'
}

export enum DeviceDarkModeSettings {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}