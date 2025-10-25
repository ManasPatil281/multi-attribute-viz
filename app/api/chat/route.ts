import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, dataContext } = await request.json();

    if (!question || !dataContext) {
      return NextResponse.json(
        { error: 'Missing question or dataContext' },
        { status: 400 }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful data analysis assistant. You help users understand their data by answering questions about it. 
          
Here is the context about the user's dataset:
${dataContext}

Provide clear, concise answers based on the data. If you perform calculations, show your work. If the question cannot be answered with the available data, explain what additional information would be needed.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}
