const { docClient, PutCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");
const { v4: uuid } = require("uuid");
const {
  validateKeys,
  validateQuestionKeys,
} = require("../../validation/validation");
//validation of keys in question
// const validateQuestionKeys = (question) => {
//   const allowedKeys = ["question", "answer", "location"];
//   console.log("question", question);
//   if (!question.question || !question.answer || !question.location) {
//     return false;
//   }
//   for (const key of allowedKeys) {
//     if (!(key in question)) return false;
//   }
//   return (
//     typeof question.question === "string" &&
//     typeof question.answer === "string" &&
//     typeof question.location === "object"
//   );
// };
// //validate the keys from body
// const validateKeys = (quizName, questions) => {
//   if (typeof quizName !== "string") {
//     return false;
//   }
//   const isArray = Array.isArray(questions);
//   console.log("isarray", isArray);
//   if (!isArray) {
//     return false;
//   }
//   const isValidQuestionKeys = questions.every(validateQuestionKeys);
//   console.log("isvalidquestionkeys", isValidQuestionKeys);
//   if (!isValidQuestionKeys) {
//     return false;
//   }
//   return true;
// };

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
      console.log("eventbody", event.body);
      console.log(quizName, questions);
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
