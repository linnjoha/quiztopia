const { docClient, PutCommand, GetCommand } = require("../../service/db");
const middy = require("@middy/core");
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../../utils/bcrypt");
const { sendResponse, sendError } = require("../../responses");

const addUser = async (user) => {
  try {
    const command = new PutCommand({
      TableName: "quiztopiaUsersTable",
      Item: {
        userId: user.userId,
        userName: user.userName,
        password: user.password,
      },
    });

    const { Item } = await docClient.send(command);
    return { data: Item, success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};
const isThereAUserByUserName = async (userName) => {
  try {
    const command = new GetCommand({
      TableName: "quiztopiaUsersTable",
      Key: { userName: userName },
    });
    const { Item } = await docClient.send(command);
    if (Item) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
};

const handler = middy().handler(async (event) => {
  try {
    const { userName, password } = JSON.parse(event.body);

    if (!userName || !password) {
      return sendError(400, { message: "Username and password is required" });
    }
    const id = uuidv4();
    //kolla så att userName är unikt
    const hashedPassword = await hashPassword(password);
    const newUser = {
      userId: id,
      userName: userName,
      password: hashedPassword,
    };
    const isUserNameAvailable = await isThereAUserByUserName(userName);
    if (!isUserNameAvailable) {
      return sendError(400, "userName not available");
    }
    const response = await addUser(newUser);
    if (!response.success) {
      return sendError(500, "Could not add user to db");
    }

    console.log(response.Item);
    return sendResponse({ userName, userId: id });
  } catch (error) {
    return sendError(500, { message: "Could not add user to databse" });
  }
});

module.exports = { handler };
