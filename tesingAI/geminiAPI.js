import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({});

const history = [];

async function chatApp(question) {
  const interaction1 = await ai.interactions.create({
    model: "gemini-3.8-flash",
    store: false,
    input: [
      ...history,
      {
        type: "user_input",
        content: [{ type: "text", text: question }],
      },
    ],
  });
  console.log("Response:", interaction1.steps.at(-1).content[0].text);

  history.push(...interaction1.steps);
}

while(true){
    const question = readlineSync.question("Ask me anything:");
    await chatApp(question);
}