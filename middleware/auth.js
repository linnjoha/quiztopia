const jwt = require("jsonwebtoken");

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token) throw new Error();

      const data = jwt.verify(token, "zxcvb12345");
      console.log("datastoken", data);
      request.event.id = data.id;
      request.event.userName = data.userName;
      console.log("dataid", data.id);
      return request.response;
    } catch (error) {
      request.event.error = "401";
      return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = "401";
    return request.response;
  },
};

const generateToken = (id, userName) => {
  return jwt.sign({ id: id, userName: userName }, "zxcvb12345", {
    expiresIn: "1h",
  });
};

module.exports = { generateToken, validateToken };
