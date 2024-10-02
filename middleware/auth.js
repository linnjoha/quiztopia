const jwt = require("jsonwebtoken");

//validera token
const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token) throw new Error();

      const data = jwt.verify(token, "zxcvb12345");

      request.event.id = data.id;
      request.event.userName = data.userName;
      return request.response;
    } catch (error) {
      return request.response;
    }
  },
};

//skapa token
const generateToken = (id, userName) => {
  return jwt.sign({ id: id, userName: userName }, "zxcvb12345", {
    expiresIn: "1h",
  });
};

module.exports = { generateToken, validateToken };
