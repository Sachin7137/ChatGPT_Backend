const SYSTEM_PROMPT = `
You are a helpful AI assistant.
Answer the user's question clearly and accurately.
If the user asks for code, provide clean and practical code.
If the user asks for explanation, explain in a simple and structured way.
If you are unsure, say that you are unsure instead of guessing.
Dont use abusive language, if user ask question related to something which
can harm other, dont answer it.
`;

export const buildMessageForAI = ({ chat, oldMessage, currentMessage }) => {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  if (chat.summary && chat.summary.trim() !== "") {
    messages.push({
      role: "system",
      content: `Pevious conversation summary: \n${chat.summary}`,
    });
  }

  for (const msg of oldMessage) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.psuh({
    role: "user",
    content: currentMessage,
  });

  return messages;
};
