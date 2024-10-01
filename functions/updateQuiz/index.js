const { docClient, UpdateCommand, QueryCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");
const { validateQuestionKeys } = require("../../validation/validation");

const addNewQuestionValues = async (quizId, questions) => {
  try {
    const command = new UpdateCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: quizId },
      UpdateExpression: "SET questions = :questions",
      ExpressionAttributeValues: { ":questions": questions },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    console.log("response", response);
    return { success: true, data: response };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getOneQuiz = async (userName, quizId) => {
  try {
    const command = new QueryCommand({
      TableName: "quiztopiaQuizTable",
      IndexName: "creatorQuizIndex",
      KeyConditionExpression: "creator = :creator AND quizId = :quizId",
      ExpressionAttributeValues: {
        ":creator": userName,
        ":quizId": quizId,
      },
      ProjectionExpression: "quizName, creator, quizId, questions",
    });
    const { Items } = await docClient.send(command);
    console.log(JSON.stringify(Items, null, 2));
    console.log("items", Items);
    if (!Items) {
      return { success: false };
    }

    return { success: true, Items };
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
      const quizId = event.pathParameters.quizId;
      const oldQuizValues = await getOneQuiz(event.userName, quizId);
      if (!oldQuizValues.success) {
        return sendError(
          400,
          "Failed to get quiz, you can only update a quiz where you are the creator"
        );
      }
      console.log("oldquizarray", oldQuizValues);

      const { questions } = JSON.parse(event.body);
      console.log("bodyquestions", questions);
      const isValidKeys = questions.every(validateQuestionKeys);
      const expectedFormat = {
        questions: [
          {
            question: "string",
            answer: "string",
            location: { longitude: "string", latitude: "string" },
          },
        ],
      };
      if (!isValidKeys) {
        return sendError(400, "invalid keys in question", expectedFormat);
      }

      let questionsArray = [...oldQuizValues.Items[0].questions];

      console.log("questionsarray", questionsArray);
      questions.forEach((q) => {
        questionsArray.push(q);
      });
      const response = await addNewQuestionValues(quizId, questionsArray);
      if (!response.success) {
        return sendError(500, "failed to update questions to db");
      }

      return sendResponse(response);
    } catch (error) {
      console.log(error);
      return sendError(500, "could not update your quiz");
    }
  });

module.exports = { handler };
