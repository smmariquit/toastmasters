const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FILE_PATH = path.join(__dirname, 'jamie.mp4');

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

async function transcribeAudio() {
  try {
    console.log('Starting transcription of jamie.mp4...');
    
    const audioFile = fs.createReadStream(FILE_PATH);

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    console.log('\n✓ Transcription completed successfully!\n');
    console.log('Transcription:');
    console.log('-'.repeat(50));
    console.log(transcription.text);
    console.log('-'.repeat(50));
    
  } catch (error) {
    console.error('Error during transcription:', error.message);
    process.exit(1);
  }
}

transcribeAudio();
