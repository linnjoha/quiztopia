const { docClient, UpdateCommand, GetCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");
const { validateLeaderboardBody } = require("../../validation/validation");

const getOneQuiz = async (quizId) => {
  try {
    const command = new GetCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: quizId },
    });
    const { Item } = await docClient.send(command);

    console.log("items", Item);
    if (!Item) {
      return { success: false };
    }

    return { success: true, Item };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const addToLeaderboard = async (quizId, leaderboardArray) => {
  try {
    const command = new UpdateCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: quizId },
      UpdateExpression: "SET leaderboard = :leaderboard",
      ExpressionAttributeValues: { ":leaderboard": leaderboardArray },
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
      const { quizId, score } = JSON.parse(event.body);
      if (!quizId || !score) {
        return sendError(400, "both quizId and score is required");
      }
      const isValidKeys = validateLeaderboardBody(quizId, score);
      const expectedFormat = {
        quizId: "string",
        score: "number",
      };
      if (!isValidKeys) {
        return sendError(400, "invalid types in body", expectedFormat);
      }
      const response = await getOneQuiz(quizId);

      if (!response.success) {
        return sendError(400, "Couln't find quiz by given quizId");
      }
      const leaderboardArray = response.Item.leaderboard;
      const leaderboardData = {
        score: score,
        userName: event.userName,
      };
      leaderboardArray.push(leaderboardData);
      const leaderboardResponse = await addToLeaderboard(
        quizId,
        leaderboardArray
      );

      if (!leaderboardResponse.success) {
        return sendError(500, "failed to add leaderboarddata to db");
      }
      return sendResponse(leaderboardResponse);
    } catch (error) {
      console.log(error);
      return sendResponse(500, "failed to add your score to leaderboard");
    }
  });

module.exports = { handler };
