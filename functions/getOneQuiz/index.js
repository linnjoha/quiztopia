const { docClient, GetCommand } = require("../../service/db");
const middy = require("@middy/core");
const { sendResponse, sendError } = require("../../responses");

const getOneQuiz = async (id) => {
  try {
    const command = new GetCommand({
      TableName: "quiztopiaQuizTable",
      Key: { quizId: id },
    });

    const { Item } = await docClient.send(command);
    if (!Item) {
      return { success: false };
    }
    return { data: Item, success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

//hämtar ett quiz med quizId och skickar tillbaka quiznamn samt frågor
const handler = middy().handler(async (event) => {
  try {
    const quizId = event.pathParameters.quizId;

    console.log("quizid", quizId);
    const response = await getOneQuiz(quizId);

    if (!response.success) {
      return sendError(500, "could not get quiz form db ");
    }
    const data = {
      quizName: response.data.quizName,
      questions: response.data.questions.map((q) => q.question),
    };

    return sendResponse(data);
  } catch (error) {
    console.log(error);
    return sendError(500, "could not get quiz form db ");
  }
});

module.exports = { handler };
