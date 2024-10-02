const bcrypt = require("bcryptjs");
//funktion för att hasha och jämföra lösenord
export const hashPassword = async (password) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
  const isMatchedPassword = await bcrypt.compare(password, hashedPassword);
  return isMatchedPassword;
};
