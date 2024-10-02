<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Quiztopia API

## Linn Johansson

## Endpoints:

### POST - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/auth/signup

- body:{
  "userName":"",
  "password":""
  }

### POST - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/auth/login

- body:{
  "userName":"",
  "password":""
  }

### GET - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz

### GET - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz/{quizId}

### POST - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz

- headers Authorization: jwt token
- body:{"quizName":"",
  "questions":[
  {"question":"", "answer":"","location":{ "longitude":"", "latitude":""}},
  {"question":"", "answer":"","location":{ "longitude":"", "latitude":""}},
  {"question":"", "answer":"","location":{ "longitude":"", "latitude":""}}
  ]
  }

### PUT - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz/{quizId}

- headers Authorization: jwt token
- body:{
  "questions":[
  {"question":"", "answer":"", "location":{"longitude":"", "latitude":""}},
  {"question":"", "answer":"", "location":{"longitude":"", "latitude":""}}
  ]
  }

### PUT - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz/leaderboard

- headers Authorization: jwt token
- body:{
  "quizId":"",
  "score":number
  }

### GET - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz/{quizId}/leaderboard

- headers Authorization: jwt token

### DELETE - https://bm8zsx77e1.execute-api.eu-north-1.amazonaws.com/api/quiz/{quizId}

- headers Authorization: jwt token

## valideringar

### signup

undersöker så att username inte är upptagen samt att username och password har korrekt värde

### login

validering på värdet från body samt att password stämmer överens

### addquiz

validering på värden från body, samt token från header

### updatequiz

validering på värden från body, samt token från header, även att username från token är samma som creator på qiuz

### deletequiz

validering på token från header, samt att username från token är densamma som creator på quiz

### addToLeaderboard

validering på värden från body, samt token från header

### getLeaderboard

validering på token, då jag anser att man behöver vara inloggad för att se den typen av information på quiz
