const { docClient, QueryCommand, DeleteCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");

const removeQuiz = async (quizId) => {
  try {
    const command = new DeleteCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: quizId },
      ReturnValues: "ALL_OLD",
    });
    const response = docClient.send(command);
    console.log("response", response);
    return { success: true, response };
  } catch (error) {
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
      const response = await getOneQuiz(event.userName, quizId);
      if (!response.success) {
        return sendError(
          400,
          "you must be the creator of the quiz to be able to remove it"
        );
      }

      const removeResponse = await removeQuiz(quizId);
      if (!removeResponse.success) {
        return sendError(500, "failed to delete quiz from db");
      }
      return sendResponse({
        sucess: true,
        message: "Your quiz is now deleted",
      });
    } catch (error) {
      console.log(error);
      return sendError(500, "failed to delete quiz");
    }
  });

module.exports = { handler };
