const { docClient, GetCommand } = require("../../service/db");
const middy = require("@middy/core");
const { generateToken } = require("../../middleware/auth");
const { comparePassword } = require("../../utils/bcrypt");
const { sendResponse, sendError } = require("../../responses");

const findUser = async (userName) => {
  try {
    const params = new GetCommand({
      TableName: "quiztopiaUsersTable",
      Key: { userName: userName },
    });
    const { Item } = await docClient.send(params);

    if (!Item) {
      return false;
    }
    return Item;
  } catch (error) {
    console.log("error", error);
  }
};

const handler = middy().handler(async (event) => {
  try {
    const { userName, password } = JSON.parse(event.body);
    console.log("id password", password, userName);
    if (!userName || !password) {
      return sendError(400, { message: "Username and password is required" });
    }
    const user = await findUser(userName);
    console.log(user);
    if (!user) {
      return sendError(404, "user not found");
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return sendError(400, "invalid password");
    }
    const token = generateToken(user.userId, userName);

    return sendResponse({
      userId: user.userId,
      userName,
      token,
      message: "success, you have now logged in to quiztopia!",
    });
  } catch (error) {
    return sendError(500, { message: "Could not login" });
  }
});

module.exports = { handler };
