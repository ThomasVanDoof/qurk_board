import { validateRegistrationData, RegistrationData } from "./validateRegistrationData";
import { findUserByEmail } from "./findUserByEmail";
import { hashPassword } from "./hashPassword";
import { createUser } from "./createUser";

export async function registerUser(data: RegistrationData) {

  const validation = validateRegistrationData(data);

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: "An account with this email already exists.",
      },
    };
  }

  // Hash the password
  const hashedPassword = await hashPassword(data.password);

  const user = await createUser({
    username: data.username,
    email: data.email,
    password: hashedPassword,
  });


  return {
    success: true,
    user,
  };
}