const { docClient, GetCommand } = require("../../service/db");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse, sendError } = require("../../responses");

const getLeaderBoard = async (quizId) => {
  try {
    const command = new GetCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: quizId },
      ProjectionExpression: "quizName, leaderboard",
    });

    const { Item } = await docClient.send(command);
    console.log("item", Item);

    return { success: true, Item };
  } catch (error) {
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
      //hämtar quiz från db
      const response = await getLeaderBoard(quizId);
      if (!response.success) {
        return sendError(500, "failed to get leaderboard from db");
      }
      //skapar en ny sorterad array baserad på score, där högsta värdet är först
      const sortedLeaderBoard = response.Item.leaderboard.sort(
        (a, b) => b.score - a.score
      );
      //sätter en maxlängd på leaderboard till fem
      const topFive = sortedLeaderBoard.slice(0, 5);

      return sendResponse({
        quizName: response.Item.quizName,
        topFive: topFive,
      });
    } catch (error) {
      console.log(error);
      return sendError(500, "failed to get leaderboard from db");
    }
  });

module.exports = { handler };
