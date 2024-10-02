const { docClient, QueryCommand } = require("../service/db");

//validering så att frågorna har rätt typ av keys och värden
export const validateQuestionKeys = (question) => {
  const allowedKeys = ["question", "answer", "location"];
  console.log("question", question);
  if (!question.question || !question.answer || !question.location) {
    return false;
  }
  for (const key of allowedKeys) {
    if (!(key in question)) return false;
  }
  return (
    typeof question.question === "string" &&
    typeof question.answer === "string" &&
    typeof question.location === "object" &&
    typeof question.location.longitude === "string" &&
    typeof question.location.latitude === "string"
  );
};

//validering av värdet på quizname och questions
export const validateKeys = (quizName, questions) => {
  if (typeof quizName !== "string") {
    return false;
  }
  const isArray = Array.isArray(questions);
  console.log("isarray", isArray);
  if (!isArray) {
    return false;
  }
  const isValidQuestionKeys = questions.every(validateQuestionKeys);
  console.log("isvalidquestionkeys", isValidQuestionKeys);
  if (!isValidQuestionKeys) {
    return false;
  }
  return true;
};

export const validateLeaderboardBody = (quizId, score) => {
  if (typeof quizId != "string" || typeof score != "number") {
    return false;
  }
  return true;
};

//validering att user är creator av quiz när det ska uppdateras och tas bort
export const validateUsersQuiz = async (userName, quizId) => {
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
