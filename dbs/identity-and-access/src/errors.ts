class IdentityNotFoundError extends Error {
  constructor(message = "Identity not found") {
    super(message);
    this.name = "IdentityNotFoundError";
    Object.setPrototypeOf(this, IdentityNotFoundError.prototype);
  }
}

class InvalidCredentialsError extends Error {
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsError";
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

class EmailExistsError extends Error {
  constructor(message = "Email already exists") {
    super(message);
    this.name = "EmailExistsError";
    Object.setPrototypeOf(this, EmailExistsError.prototype);
  }
}

class AccountLockedError extends Error {
  constructor(message = "Account temporarily locked") {
    super(message);
    this.name = "AccountLockedError";
    Object.setPrototypeOf(this, AccountLockedError.prototype);
  }
}

class InvalidCurrentPasswordError extends Error {
  constructor(message = "Invalid current password") {
    super(message);
    this.name = "InvalidCurrentPasswordError";
    Object.setPrototypeOf(this, InvalidCurrentPasswordError.prototype);
  }
}

class PasswordReuseError extends Error {
  constructor(message = "Password does not meet requirements") {
    super(message);
    this.name = "PasswordReuseError";
    Object.setPrototypeOf(this, PasswordReuseError.prototype);
  }
}

class UsernameExistsError extends Error {
  constructor(message = "Username already exists") {
    super(message);
    this.name = "UsernameExistsError";
    Object.setPrototypeOf(this, UsernameExistsError.prototype);
  }
}

class RoleNotFoundError extends Error {
  constructor(message = "Role not found") {
    super(message);
    this.name = "RoleNotFoundError";
    Object.setPrototypeOf(this, RoleNotFoundError.prototype);
  }
}

class RoleNameExistsError extends Error {
  constructor(message = "Role name already exists") {
    super(message);
    this.name = "RoleNameExistsError";
    Object.setPrototypeOf(this, RoleNameExistsError.prototype);
  }
}

class GroupNotFoundError extends Error {
  constructor(message = "Group not found") {
    super(message);
    this.name = "GroupNotFoundError";
    Object.setPrototypeOf(this, GroupNotFoundError.prototype);
  }
}

class GroupNameExistsError extends Error {
  constructor(message = "Group name already exists") {
    super(message);
    this.name = "GroupNameExistsError";
    Object.setPrototypeOf(this, GroupNameExistsError.prototype);
  }
}

class PolicyNotFoundError extends Error {
  constructor(message = "Policy not found") {
    super(message);
    this.name = "PolicyNotFoundError";
    Object.setPrototypeOf(this, PolicyNotFoundError.prototype);
  }
}

class PolicyNameExistsError extends Error {
  constructor(message = "Policy name already exists") {
    super(message);
    this.name = "PolicyNameExistsError";
    Object.setPrototypeOf(this, PolicyNameExistsError.prototype);
  }
}

class SessionNotFoundError extends Error {
  constructor(message = "Session not found") {
    super(message);
    this.name = "SessionNotFoundError";
    Object.setPrototypeOf(this, SessionNotFoundError.prototype);
  }
}

class SessionExpiredError extends Error {
  constructor(message = "Session has expired") {
    super(message);
    this.name = "SessionExpiredError";
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}

class SessionRevokedError extends Error {
  constructor(message = "Session has been revoked") {
    super(message);
    this.name = "SessionRevokedError";
    Object.setPrototypeOf(this, SessionRevokedError.prototype);
  }
}

class OtpNotFoundError extends Error {
  constructor(message = "OTP not found") {
    super(message);
    this.name = "OtpNotFoundError";
    Object.setPrototypeOf(this, OtpNotFoundError.prototype);
  }
}

class OtpExpiredError extends Error {
  constructor(message = "OTP expired") {
    super(message);
    this.name = "OtpExpiredError";
    Object.setPrototypeOf(this, OtpExpiredError.prototype);
  }
}

class MaxOtpAttemptsExceededError extends Error {
  constructor(message = "Maximum attempts exceeded") {
    super(message);
    this.name = "MaxOtpAttemptsExceededError";
    Object.setPrototypeOf(this, MaxOtpAttemptsExceededError.prototype);
  }
}

class InvalidOtpError extends Error {
  constructor(message = "Invalid OTP") {
    super(message);
    this.name = "InvalidOtpError";
    Object.setPrototypeOf(this, InvalidOtpError.prototype);
  }
}

export {
  AccountLockedError,
  EmailExistsError,
  GroupNameExistsError,
  GroupNotFoundError,
  IdentityNotFoundError,
  InvalidCredentialsError,
  InvalidCurrentPasswordError,
  InvalidOtpError,
  MaxOtpAttemptsExceededError,
  OtpExpiredError,
  OtpNotFoundError,
  PasswordReuseError,
  PolicyNameExistsError,
  PolicyNotFoundError,
  RoleNameExistsError,
  RoleNotFoundError,
  SessionExpiredError,
  SessionNotFoundError,
  SessionRevokedError,
  UsernameExistsError,
};
