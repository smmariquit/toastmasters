// functions/api/feedback.ts

type FeedbackContext = {
  request: Request;
  env: {
    OPENAI_API_KEY?: string;
  };
};

export const onRequestPost = async (context: FeedbackContext) => {
  try {
    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { transcription, speechType, speechTitle } = await context.request.json();

    if (!transcription) {
      return Response.json({ error: 'No transcription provided' }, { status: 400 });
    }

    const systemPrompt = `You are an expert Toastmasters speech coach and evaluator. Analyze the following speech transcription and provide detailed, constructive feedback following the Toastmasters evaluation method (Commend-Recommend-Commend).

Your response must be in the following JSON format:
{
  "overallScore": <number 1-10>,
  "summary": "<brief 2-3 sentence summary of the speech quality>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "detailedAnalysis": {
    "clarity": { "score": <1-10>, "feedback": "<specific feedback about clarity of message>" },
    "structure": { "score": <1-10>, "feedback": "<specific feedback about speech structure (opening, body, conclusion)>" },
    "delivery": { "score": <1-10>, "feedback": "<specific feedback about vocal variety, pace, pauses>" },
    "content": { "score": <1-10>, "feedback": "<specific feedback about substance and relevance>" },
    "engagement": { "score": <1-10>, "feedback": "<specific feedback about audience connection>" }
  },
  "suggestedExercises": ["<exercise 1>", "<exercise 2>", "<exercise 3>"]
}

Be encouraging but honest. Focus on actionable improvements. Consider that this is a ${speechType || 'prepared speech'}${speechTitle ? ` titled "${speechTitle}"` : ''}.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this speech transcription:\n\n${transcription}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return Response.json({ error: 'Failed to generate feedback' }, { status: response.status });
    }

    const result = await response.json();
    const feedback = JSON.parse(result.choices[0].message.content);

    return Response.json({
      ...feedback,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Feedback generation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
