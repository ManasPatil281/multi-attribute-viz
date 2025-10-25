export async function queryDataWithGroq(
  question: string,
  dataContext: string
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        dataContext,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Failed to get response from AI');
  }
}
