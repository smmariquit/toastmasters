// functions/api/transcribe.ts
//
// Routed through Vercel AI Gateway instead of api.openai.com directly: Cloudflare Pages
// Functions execute in arbitrary PoPs (including colos OpenAI geo-blocks, e.g. HK), but
// AI Gateway's endpoint is not subject to that block. See PR #2 discussion.
//
// AI Gateway has no documented plain multipart REST endpoint for Whisper (unlike chat
// completions), so this uses the official `ai` SDK's transcription model instead of a
// hand-rolled fetch. `createGateway` is called with an explicit apiKey rather than relying
// on process.env, since Cloudflare Pages Functions don't populate it like Vercel does.
import { createGateway, experimental_transcribe as transcribe } from 'ai';

type TranscribeContext = {
  request: Request;
  env: {
    AI_GATEWAY_API_KEY?: string;
  };
};

export const onRequestPost = async (context: TranscribeContext) => {
  try {
    const apiKey = context.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
    }

    const formData = await context.request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const gateway = createGateway({ apiKey });
    const audio = new Uint8Array(await audioFile.arrayBuffer());

    const result = await transcribe({
      model: gateway.transcription('openai/whisper-1'),
      audio,
      providerOptions: { openai: { language: 'en' } },
    });

    return Response.json({
      transcription: result.text,
      duration: result.durationInSeconds,
      segments: result.segments,
    });
  } catch (error) {
    // Both APICallError (provider-level) and GatewayError (gateway-level, e.g. billing or
    // auth failures) carry a `statusCode`; duck-type on it to avoid importing every subclass.
    const statusCode = (error as { statusCode?: unknown })?.statusCode;
    if (typeof statusCode === 'number') {
      console.error('AI Gateway error:', error);
      return Response.json({ error: 'Failed to transcribe audio' }, { status: statusCode });
    }
    console.error('Transcription error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
