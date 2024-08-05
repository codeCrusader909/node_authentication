import bcrypt from "bcrypt";

export const hashPassword = async (password, next) => {
  try {
    return {success:"true", res: await bcrypt.hash(password, 12)};
  } catch (error) {
    return {success:"false", res: "encounterd error in hashing password"};
  }
};
export const compareHashedPassword = async (password, hashPassword, next) => {
  try {
    return {success:"true", res: await bcrypt.compare(password, hashPassword)};
  } catch (error) {
    return {success:"false", res: "encounterd error in comparing hashed password"};
  }
};
