// functions/api/transcribe.ts

type TranscribeContext = {
  request: Request;
  env: {
    OPENAI_API_KEY?: string;
  };
};

export const onRequestPost = async (context: TranscribeContext) => {
  try {
    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const formData = await context.request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const openAIFormData = new FormData();
    openAIFormData.append('file', audioFile);
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('response_format', 'verbose_json');
    openAIFormData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAIFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return Response.json({ error: 'Failed to transcribe audio' }, { status: response.status });
    }

    const result = await response.json();

    return Response.json({
      transcription: result.text,
      duration: result.duration,
      segments: result.segments,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
