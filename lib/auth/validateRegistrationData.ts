export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export function validateRegistrationData(
  data: RegistrationData
): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  // Username
  if (!data.username.trim()) {
    errors.username = "Username is required.";
  } else if (data.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (data.username.trim().length > 40) {
    errors.username = "Username must be 40 characters or fewer.";
  }

  // Email
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (data.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Password
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (data.password.length > 128) {
    errors.password = "Password must be 128 characters or fewer.";
  }

  // Confirm password
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}