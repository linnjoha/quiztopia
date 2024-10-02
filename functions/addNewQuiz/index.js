const { docClient, PutCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");
const { v4: uuid } = require("uuid");
const { validateKeys } = require("../../validation/validation");

//lägger till nytt quiz med värden från body, token samt skapar en tom array för leaderboard
const addQuiz = async (quiz) => {
  try {
    const leaderboard = [];
    const command = new PutCommand({
      TableName: "quiztopiaQuizTable",
      Item: {
        quizId: quiz.quizId,
        quizName: quiz.quizName,
        questions: quiz.questions,
        creator: quiz.userName,
        leaderboard,
      },
    });
    const response = await docClient.send(command);
    console.log("quizresponse", response);
    console.log("item", response.Item);

    return { success: true };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const handler = middy()
  .use(validateToken)
  .handler(async (event) => {
    try {
      if (!event.id || !event.userName) {
        return sendError(
          401,
          "Unauthorized through invalid token, try to login again"
        );
      }
      const userName = event.userName;

      const { quizName, questions } = JSON.parse(event.body);

      if (!quizName || !questions) {
        return sendError(400, "both quizname and questions are required");
      }
      const isValidKeys = validateKeys(quizName, questions);

      const expectedFormat = {
        quizName: "string",
        questions: [
          {
            question: "string",
            answer: "string",
            location: { longitude: "string", latitude: "string" },
          },
        ],
      };
      if (!isValidKeys) {
        return sendError(400, "invalid keys to questions", expectedFormat);
      }
      const quizId = uuid();
      const response = await addQuiz({ quizName, questions, quizId, userName });
      if (!response.success) {
        return sendError(500, "could not add quiz to db");
      }
      return sendResponse({ success: true, quizName, questions, quizId });
    } catch (error) {
      console.log(error);
      return sendError(500, "could not add quiz to db");
    }
  });

module.exports = {
  handler,
};
