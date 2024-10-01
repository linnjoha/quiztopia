const { docClient, ScanCommand } = require("../../service/db");
const middy = require("@middy/core");
const { sendResponse, sendError } = require("../../responses");

//get all quiz, with only quizName and creator
const getAllQuiz = async () => {
  try {
    const command = new ScanCommand({
      TableName: "quiztopiaQuizTable",
      ProjectionExpression: "quizName, creator",
    });

    const { Items } = await docClient.send(command);
    if (!Items) {
      return { success: false };
    }
    return { data: Items, success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

const handler = middy().handler(async (event) => {
  try {
    const response = await getAllQuiz();

    if (!response.success) {
      return sendError(500, "could not get all quiz form db ");
    }

    return sendResponse(response);
  } catch (error) {
    console.log(error);
    return sendError(500, "could not get all quiz form db ");
  }
});

module.exports = { handler };
