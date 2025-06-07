const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAIResponse = async (userMessage) => {
  try {
    if (process.env.USE_MOCK_AI === 'true') {
      return `🧪 Mock AI: You asked "${userMessage}" — I'm just a dummy in dev mode.`;
    }
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are Unichat AI, a helpful assistant for university students. Your tone is friendly, knowledgeable, and supportive. You answer questions concisely and accurately based on typical university information. If you do not know an answer, say so politely.'
        },
        {
          role: 'user',
          content: userMessage,
        }
      ],
      model: 'gpt-3.5-turbo',
    });

    // 5. Extract the AI's reply from the response object.
    // The response contains a 'choices' array, and we typically want the first one.
    const aiResponse = completion.choices[0].message.content;
    return aiResponse;

  } catch (error) {
    // 6. Robust error handling.
    console.error("Error communicating with OpenAI API:", error);
    // Provide a user-friendly error message if the API call fails.
    return "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
};

// Export the function to be used in other parts of our application.
module.exports = { getAIResponse };