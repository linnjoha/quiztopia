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
    typeof question.location === "object"
  );
};

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
