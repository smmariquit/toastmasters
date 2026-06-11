// src/lib/database.ts

import { Database, Club, Member, Meeting, GrammarianSession, AhCounterSession, TimerSession, EvaluationSession, MemberPerformanceStats, SpeechRecording } from './types';
import { v4 as uuidv4 } from 'uuid';

// Static member IDs for UPLB Gavel Club (so we can reference them in meetings)
const UPLB_MEMBERS = {
  jomar: 'member-jomar-garcia',
  kasandra: 'member-kasandra-martinez',
  dave: 'member-dave-solis',
  jaymee: 'member-jaymee-arcilla',
  aj: 'member-aj-escabusa',
  andrew: 'member-andrew-pabale',
  angela: 'member-angela-umandap',
  ataram: 'member-ataram-gabriel',
  euri: 'member-euri-berces',
  franco: 'member-franco-andrade',
  james: 'member-james-valdez',
  jamie: 'member-jamie',
  jedd: 'member-jedd-deleon',
  jenelle: 'member-jenelle-pamatmat',
  juleana: 'member-juleana-mendoza',
  karen: 'member-karen-velasco',
  lei: 'member-lei-john',
  mary: 'member-mary-mendizabal',
  matt: 'member-matt-cantela',
  rimple: 'member-rimple-monreal',
  sheena: 'member-sheena-tumon',
  simonee: 'member-simonee-ezekiel',
};

// Helper to generate past dates
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Default database with two clubs
const defaultDatabase: Database = {
  clubs: [
    {
      id: 'uplb-gavel-club',
      name: 'UPLB Gavel Club',
      description: 'The premier public speaking club at the University of the Philippines Los Baños. We help students and faculty develop their communication and leadership skills.',
      location: 'UPLB, Los Baños, Laguna, Philippines',
      meetingDay: 'Saturday',
      meetingTime: '09:00 AM',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: 'toastmasters-club',
      name: 'Toastmasters Club',
      description: 'A welcoming community dedicated to helping members become confident public speakers and leaders.',
      location: 'Online / Hybrid',
      meetingDay: 'Wednesday',
      meetingTime: '07:00 PM',
      createdAt: '2024-06-01T00:00:00.000Z',
    },
  ],
  members: [
    // UPLB Gavel Club Members (from images)
    { id: UPLB_MEMBERS.jomar, clubId: 'uplb-gavel-club', name: 'Jomar C. Garcia', email: 'jomar.garcia@up.edu.ph', role: 'officer', joinedAt: '2024-01-15T00:00:00.000Z' },
    { id: UPLB_MEMBERS.kasandra, clubId: 'uplb-gavel-club', name: 'Kasandra Martinez', email: 'kasandra.martinez@up.edu.ph', role: 'officer', joinedAt: '2024-01-20T00:00:00.000Z' },
    { id: UPLB_MEMBERS.dave, clubId: 'uplb-gavel-club', name: 'Dave Solis', email: 'dave.solis@up.edu.ph', role: 'officer', joinedAt: '2024-02-01T00:00:00.000Z' },
    { id: UPLB_MEMBERS.jaymee, clubId: 'uplb-gavel-club', name: 'Jaymee Arcilla', email: 'jaymee.arcilla@up.edu.ph', role: 'member', joinedAt: '2024-02-10T00:00:00.000Z' },
    { id: UPLB_MEMBERS.aj, clubId: 'uplb-gavel-club', name: 'AJ Escabusa', email: 'aj.escabusa@up.edu.ph', role: 'member', joinedAt: '2024-02-15T00:00:00.000Z' },
    { id: UPLB_MEMBERS.andrew, clubId: 'uplb-gavel-club', name: 'Andrew Pabale', email: 'andrew.pabale@up.edu.ph', role: 'member', joinedAt: '2024-02-20T00:00:00.000Z' },
    { id: UPLB_MEMBERS.angela, clubId: 'uplb-gavel-club', name: 'Angela Eunice Umandap', email: 'angela.umandap@up.edu.ph', role: 'member', joinedAt: '2024-03-01T00:00:00.000Z' },
    { id: UPLB_MEMBERS.ataram, clubId: 'uplb-gavel-club', name: 'Ataram Gabriel', email: 'ataram.gabriel@up.edu.ph', role: 'member', joinedAt: '2024-03-05T00:00:00.000Z' },
    { id: UPLB_MEMBERS.euri, clubId: 'uplb-gavel-club', name: 'Euri Berces', email: 'euri.berces@up.edu.ph', role: 'member', joinedAt: '2024-03-10T00:00:00.000Z' },
    { id: UPLB_MEMBERS.franco, clubId: 'uplb-gavel-club', name: 'Franco Miguel Andrade', email: 'franco.andrade@up.edu.ph', role: 'member', joinedAt: '2024-03-15T00:00:00.000Z' },
    { id: UPLB_MEMBERS.james, clubId: 'uplb-gavel-club', name: 'James Nicholas Valdez', email: 'james.valdez@up.edu.ph', role: 'member', joinedAt: '2024-03-20T00:00:00.000Z' },
    { id: UPLB_MEMBERS.jamie, clubId: 'uplb-gavel-club', name: 'Jamie', email: 'jamie@up.edu.ph', role: 'member', joinedAt: '2024-04-01T00:00:00.000Z' },
    { id: UPLB_MEMBERS.jedd, clubId: 'uplb-gavel-club', name: 'Jedd Pearl de Leon', email: 'jedd.deleon@up.edu.ph', role: 'member', joinedAt: '2024-04-05T00:00:00.000Z' },
    { id: UPLB_MEMBERS.jenelle, clubId: 'uplb-gavel-club', name: 'Jenelle Allyza Pamatmat', email: 'jenelle.pamatmat@up.edu.ph', role: 'member', joinedAt: '2024-04-10T00:00:00.000Z' },
    { id: UPLB_MEMBERS.juleana, clubId: 'uplb-gavel-club', name: 'Juleana Marie Mendoza', email: 'juleana.mendoza@up.edu.ph', role: 'member', joinedAt: '2024-04-15T00:00:00.000Z' },
    { id: UPLB_MEMBERS.karen, clubId: 'uplb-gavel-club', name: 'Karen Velasco', email: 'karen.velasco@up.edu.ph', role: 'member', joinedAt: '2024-04-20T00:00:00.000Z' },
    { id: UPLB_MEMBERS.lei, clubId: 'uplb-gavel-club', name: 'Lei John', email: 'lei.john@up.edu.ph', role: 'member', joinedAt: '2024-05-01T00:00:00.000Z' },
    { id: UPLB_MEMBERS.mary, clubId: 'uplb-gavel-club', name: 'Mary Rose Mendizabal', email: 'mary.mendizabal@up.edu.ph', role: 'member', joinedAt: '2024-05-05T00:00:00.000Z' },
    { id: UPLB_MEMBERS.matt, clubId: 'uplb-gavel-club', name: 'Matt Howell Mirasol Cantela', email: 'matt.cantela@up.edu.ph', role: 'member', joinedAt: '2024-05-10T00:00:00.000Z' },
    { id: UPLB_MEMBERS.rimple, clubId: 'uplb-gavel-club', name: 'Rimple Monreal', email: 'rimple.monreal@up.edu.ph', role: 'member', joinedAt: '2024-05-15T00:00:00.000Z' },
    { id: UPLB_MEMBERS.sheena, clubId: 'uplb-gavel-club', name: 'Sheena Tumon', email: 'sheena.tumon@up.edu.ph', role: 'member', joinedAt: '2024-05-20T00:00:00.000Z' },
    { id: UPLB_MEMBERS.simonee, clubId: 'uplb-gavel-club', name: 'Simonee Ezekiel', email: 'simonee.ezekiel@up.edu.ph', role: 'member', joinedAt: '2024-06-01T00:00:00.000Z' },
    // Toastmasters Club Members
    { id: 'member-john-smith', clubId: 'toastmasters-club', name: 'John Smith', email: 'john.smith@example.com', role: 'officer', joinedAt: '2024-06-01T00:00:00.000Z' },
    { id: 'member-jane-doe', clubId: 'toastmasters-club', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'member', joinedAt: '2024-06-15T00:00:00.000Z' },
  ],
  meetings: [
    // 10 past meetings for UPLB Gavel Club
    {
      id: 'meeting-1',
      clubId: 'uplb-gavel-club',
      date: daysAgo(63), // ~9 weeks ago
      theme: 'New Beginnings',
      wordOfTheDay: { word: 'Resilience', definition: 'The capacity to recover quickly from difficulties', partOfSpeech: 'noun', exampleSentence: 'Her resilience helped her overcome the challenges.' },
      idiomOfTheDay: { idiom: 'Turn over a new leaf', meaning: 'To start fresh or make a new beginning', exampleSentence: 'After the new year, she decided to turn over a new leaf.' },
      roles: {
        toastmaster: UPLB_MEMBERS.jomar,
        generalEvaluator: UPLB_MEMBERS.kasandra,
        timer: UPLB_MEMBERS.dave,
        ahCounter: UPLB_MEMBERS.jaymee,
        grammarian: UPLB_MEMBERS.aj,
        topicsmaster: UPLB_MEMBERS.andrew,
        speakers: [
          { id: 's1', memberId: UPLB_MEMBERS.angela, speechTitle: 'Finding My Voice', speechProject: 'Ice Breaker', pathway: 'Dynamic Leadership', duration: 6 },
          { id: 's2', memberId: UPLB_MEMBERS.ataram, speechTitle: 'The Power of Stories', speechProject: 'CC2', pathway: 'Presentation Mastery', duration: 7 },
        ],
        evaluators: [
          { id: 'e1', memberId: UPLB_MEMBERS.euri, speakerSlotId: 's1' },
          { id: 'e2', memberId: UPLB_MEMBERS.franco, speakerSlotId: 's2' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt1', memberId: UPLB_MEMBERS.james, topic: 'What inspires you?', type: 'impromptu' },
          { id: 'tt2', memberId: UPLB_MEMBERS.jamie, topic: 'Your biggest challenge', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(70),
    },
    {
      id: 'meeting-2',
      clubId: 'uplb-gavel-club',
      date: daysAgo(56), // ~8 weeks ago
      theme: 'Leadership in Action',
      wordOfTheDay: { word: 'Tenacity', definition: 'The quality of being very determined', partOfSpeech: 'noun', exampleSentence: 'His tenacity led him to success.' },
      idiomOfTheDay: { idiom: 'Step up to the plate', meaning: 'To take responsibility or action', exampleSentence: 'When the team needed a leader, she stepped up to the plate.' },
      roles: {
        toastmaster: UPLB_MEMBERS.kasandra,
        generalEvaluator: UPLB_MEMBERS.jomar,
        timer: UPLB_MEMBERS.jedd,
        ahCounter: UPLB_MEMBERS.jenelle,
        grammarian: UPLB_MEMBERS.juleana,
        topicsmaster: UPLB_MEMBERS.karen,
        speakers: [
          { id: 's3', memberId: UPLB_MEMBERS.lei, speechTitle: 'Leading with Empathy', speechProject: 'CC3', pathway: 'Dynamic Leadership', duration: 7 },
          { id: 's4', memberId: UPLB_MEMBERS.mary, speechTitle: 'My Leadership Journey', speechProject: 'CC1', pathway: 'Innovative Planning', duration: 5 },
        ],
        evaluators: [
          { id: 'e3', memberId: UPLB_MEMBERS.matt, speakerSlotId: 's3' },
          { id: 'e4', memberId: UPLB_MEMBERS.rimple, speakerSlotId: 's4' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt3', memberId: UPLB_MEMBERS.sheena, topic: 'What makes a great leader?', type: 'impromptu' },
          { id: 'tt4', memberId: UPLB_MEMBERS.simonee, topic: 'A time you led others', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(63),
    },
    {
      id: 'meeting-3',
      clubId: 'uplb-gavel-club',
      date: daysAgo(49), // ~7 weeks ago
      theme: 'Communication Mastery',
      wordOfTheDay: { word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', partOfSpeech: 'adjective', exampleSentence: 'She gave an eloquent speech.' },
      idiomOfTheDay: { idiom: 'Get the ball rolling', meaning: 'To start something', exampleSentence: 'Let\'s get the ball rolling on this project.' },
      roles: {
        toastmaster: UPLB_MEMBERS.dave,
        generalEvaluator: UPLB_MEMBERS.jaymee,
        timer: UPLB_MEMBERS.aj,
        ahCounter: UPLB_MEMBERS.andrew,
        grammarian: UPLB_MEMBERS.angela,
        topicsmaster: UPLB_MEMBERS.ataram,
        speakers: [
          { id: 's5', memberId: UPLB_MEMBERS.euri, speechTitle: 'Words That Matter', speechProject: 'CC4', pathway: 'Presentation Mastery', duration: 6 },
          { id: 's6', memberId: UPLB_MEMBERS.franco, speechTitle: 'The Art of Persuasion', speechProject: 'CC5', pathway: 'Persuasive Influence', duration: 8 },
        ],
        evaluators: [
          { id: 'e5', memberId: UPLB_MEMBERS.james, speakerSlotId: 's5' },
          { id: 'e6', memberId: UPLB_MEMBERS.jamie, speakerSlotId: 's6' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt5', memberId: UPLB_MEMBERS.jomar, topic: 'Your favorite word', type: 'word-based' },
          { id: 'tt6', memberId: UPLB_MEMBERS.kasandra, topic: 'A memorable conversation', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(56),
    },
    {
      id: 'meeting-4',
      clubId: 'uplb-gavel-club',
      date: daysAgo(42), // ~6 weeks ago
      theme: 'Innovation & Creativity',
      wordOfTheDay: { word: 'Ingenuity', definition: 'The quality of being clever and inventive', partOfSpeech: 'noun', exampleSentence: 'The solution showed great ingenuity.' },
      idiomOfTheDay: { idiom: 'Think outside the box', meaning: 'To think creatively', exampleSentence: 'We need to think outside the box to solve this problem.' },
      roles: {
        toastmaster: UPLB_MEMBERS.jaymee,
        generalEvaluator: UPLB_MEMBERS.dave,
        timer: UPLB_MEMBERS.angela,
        ahCounter: UPLB_MEMBERS.ataram,
        grammarian: UPLB_MEMBERS.euri,
        topicsmaster: UPLB_MEMBERS.franco,
        speakers: [
          { id: 's7', memberId: UPLB_MEMBERS.jomar, speechTitle: 'Innovate or Stagnate', speechProject: 'CC6', pathway: 'Innovative Planning', duration: 7 },
          { id: 's8', memberId: UPLB_MEMBERS.jedd, speechTitle: 'Creative Problem Solving', speechProject: 'CC2', pathway: 'Dynamic Leadership', duration: 6 },
        ],
        evaluators: [
          { id: 'e7', memberId: UPLB_MEMBERS.jenelle, speakerSlotId: 's7' },
          { id: 'e8', memberId: UPLB_MEMBERS.juleana, speakerSlotId: 's8' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt7', memberId: UPLB_MEMBERS.karen, topic: 'An innovative solution you found', type: 'impromptu' },
          { id: 'tt8', memberId: UPLB_MEMBERS.lei, topic: 'If you could invent anything', type: 'scenario' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(49),
    },
    {
      id: 'meeting-5',
      clubId: 'uplb-gavel-club',
      date: daysAgo(35), // ~5 weeks ago
      theme: 'Building Confidence',
      wordOfTheDay: { word: 'Assurance', definition: 'Confidence or certainty in one\'s own abilities', partOfSpeech: 'noun', exampleSentence: 'She spoke with assurance.' },
      idiomOfTheDay: { idiom: 'Face the music', meaning: 'To accept the consequences of one\'s actions', exampleSentence: 'It\'s time to face the music and admit the mistake.' },
      roles: {
        toastmaster: UPLB_MEMBERS.aj,
        generalEvaluator: UPLB_MEMBERS.andrew,
        timer: UPLB_MEMBERS.mary,
        ahCounter: UPLB_MEMBERS.matt,
        grammarian: UPLB_MEMBERS.rimple,
        topicsmaster: UPLB_MEMBERS.sheena,
        speakers: [
          { id: 's9', memberId: UPLB_MEMBERS.simonee, speechTitle: 'Overcoming Stage Fright', speechProject: 'Ice Breaker', pathway: 'Presentation Mastery', duration: 5 },
          { id: 's10', memberId: UPLB_MEMBERS.kasandra, speechTitle: 'Confidence is Key', speechProject: 'CC3', pathway: 'Dynamic Leadership', duration: 7 },
        ],
        evaluators: [
          { id: 'e9', memberId: UPLB_MEMBERS.jomar, speakerSlotId: 's9' },
          { id: 'e10', memberId: UPLB_MEMBERS.dave, speakerSlotId: 's10' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt9', memberId: UPLB_MEMBERS.jaymee, topic: 'Your proudest moment', type: 'impromptu' },
          { id: 'tt10', memberId: UPLB_MEMBERS.angela, topic: 'A fear you overcame', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(42),
    },
    {
      id: 'meeting-6',
      clubId: 'uplb-gavel-club',
      date: daysAgo(28), // ~4 weeks ago
      theme: 'The Power of Storytelling',
      wordOfTheDay: { word: 'Captivate', definition: 'To attract and hold the attention of someone', partOfSpeech: 'verb', exampleSentence: 'The speaker captivated the audience.' },
      idiomOfTheDay: { idiom: 'Once upon a time', meaning: 'Used to begin fairy tales and stories', exampleSentence: 'Once upon a time, there was a brave young speaker.' },
      roles: {
        toastmaster: UPLB_MEMBERS.andrew,
        generalEvaluator: UPLB_MEMBERS.aj,
        timer: UPLB_MEMBERS.jomar,
        ahCounter: UPLB_MEMBERS.kasandra,
        grammarian: UPLB_MEMBERS.dave,
        topicsmaster: UPLB_MEMBERS.jaymee,
        speakers: [
          { id: 's11', memberId: UPLB_MEMBERS.ataram, speechTitle: 'Stories That Inspire', speechProject: 'CC4', pathway: 'Storytelling', duration: 7 },
          { id: 's12', memberId: UPLB_MEMBERS.jamie, speechTitle: 'My Life in Three Acts', speechProject: 'CC2', pathway: 'Presentation Mastery', duration: 6 },
        ],
        evaluators: [
          { id: 'e11', memberId: UPLB_MEMBERS.euri, speakerSlotId: 's11' },
          { id: 'e12', memberId: UPLB_MEMBERS.franco, speakerSlotId: 's12' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt11', memberId: UPLB_MEMBERS.james, topic: 'Tell us a story from childhood', type: 'story' },
          { id: 'tt12', memberId: UPLB_MEMBERS.jedd, topic: 'A lesson life taught you', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(35),
    },
    {
      id: 'meeting-7',
      clubId: 'uplb-gavel-club',
      date: daysAgo(21), // ~3 weeks ago
      theme: 'Professional Growth',
      wordOfTheDay: { word: 'Diligence', definition: 'Careful and persistent work or effort', partOfSpeech: 'noun', exampleSentence: 'Her diligence paid off in the end.' },
      idiomOfTheDay: { idiom: 'Burn the midnight oil', meaning: 'To work late into the night', exampleSentence: 'She burned the midnight oil to finish the project.' },
      roles: {
        toastmaster: UPLB_MEMBERS.angela,
        generalEvaluator: UPLB_MEMBERS.ataram,
        timer: UPLB_MEMBERS.euri,
        ahCounter: UPLB_MEMBERS.franco,
        grammarian: UPLB_MEMBERS.james,
        topicsmaster: UPLB_MEMBERS.jamie,
        speakers: [
          { id: 's13', memberId: UPLB_MEMBERS.jenelle, speechTitle: 'Career Lessons', speechProject: 'CC5', pathway: 'Dynamic Leadership', duration: 7 },
          { id: 's14', memberId: UPLB_MEMBERS.juleana, speechTitle: 'The Growth Mindset', speechProject: 'CC3', pathway: 'Innovative Planning', duration: 6 },
        ],
        evaluators: [
          { id: 'e13', memberId: UPLB_MEMBERS.karen, speakerSlotId: 's13' },
          { id: 'e14', memberId: UPLB_MEMBERS.lei, speakerSlotId: 's14' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt13', memberId: UPLB_MEMBERS.mary, topic: 'Your dream job', type: 'impromptu' },
          { id: 'tt14', memberId: UPLB_MEMBERS.matt, topic: 'Best career advice you received', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(28),
    },
    {
      id: 'meeting-8',
      clubId: 'uplb-gavel-club',
      date: daysAgo(14), // ~2 weeks ago
      theme: 'Embracing Change',
      wordOfTheDay: { word: 'Adaptable', definition: 'Able to adjust to new conditions', partOfSpeech: 'adjective', exampleSentence: 'Being adaptable is crucial in today\'s world.' },
      idiomOfTheDay: { idiom: 'Go with the flow', meaning: 'To accept things as they happen', exampleSentence: 'Sometimes you just need to go with the flow.' },
      roles: {
        toastmaster: UPLB_MEMBERS.ataram,
        generalEvaluator: UPLB_MEMBERS.angela,
        timer: UPLB_MEMBERS.franco,
        ahCounter: UPLB_MEMBERS.james,
        grammarian: UPLB_MEMBERS.jamie,
        topicsmaster: UPLB_MEMBERS.jedd,
        speakers: [
          { id: 's15', memberId: UPLB_MEMBERS.karen, speechTitle: 'Change is the Only Constant', speechProject: 'CC6', pathway: 'Visionary Communication', duration: 7 },
          { id: 's16', memberId: UPLB_MEMBERS.rimple, speechTitle: 'My Transformation Story', speechProject: 'CC1', pathway: 'Dynamic Leadership', duration: 5 },
        ],
        evaluators: [
          { id: 'e15', memberId: UPLB_MEMBERS.sheena, speakerSlotId: 's15' },
          { id: 'e16', memberId: UPLB_MEMBERS.simonee, speakerSlotId: 's16' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt15', memberId: UPLB_MEMBERS.jomar, topic: 'A change that shaped you', type: 'impromptu' },
          { id: 'tt16', memberId: UPLB_MEMBERS.kasandra, topic: 'If you could change one thing', type: 'scenario' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(21),
    },
    {
      id: 'meeting-9',
      clubId: 'uplb-gavel-club',
      date: daysAgo(7), // ~1 week ago
      theme: 'Celebrating Success',
      wordOfTheDay: { word: 'Triumph', definition: 'A great victory or achievement', partOfSpeech: 'noun', exampleSentence: 'The project was a triumph of teamwork.' },
      idiomOfTheDay: { idiom: 'On cloud nine', meaning: 'Extremely happy', exampleSentence: 'After winning the contest, she was on cloud nine.' },
      roles: {
        toastmaster: UPLB_MEMBERS.euri,
        generalEvaluator: UPLB_MEMBERS.franco,
        timer: UPLB_MEMBERS.james,
        ahCounter: UPLB_MEMBERS.jamie,
        grammarian: UPLB_MEMBERS.jedd,
        topicsmaster: UPLB_MEMBERS.jenelle,
        speakers: [
          { id: 's17', memberId: UPLB_MEMBERS.lei, speechTitle: 'Celebrating Small Wins', speechProject: 'CC4', pathway: 'Motivational Strategies', duration: 6 },
          { id: 's18', memberId: UPLB_MEMBERS.mary, speechTitle: 'The Journey to Success', speechProject: 'CC3', pathway: 'Dynamic Leadership', duration: 7 },
        ],
        evaluators: [
          { id: 'e17', memberId: UPLB_MEMBERS.matt, speakerSlotId: 's17' },
          { id: 'e18', memberId: UPLB_MEMBERS.jomar, speakerSlotId: 's18' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt17', memberId: UPLB_MEMBERS.dave, topic: 'Your greatest achievement', type: 'impromptu' },
          { id: 'tt18', memberId: UPLB_MEMBERS.jaymee, topic: 'How do you celebrate success?', type: 'impromptu' },
        ],
      },
      status: 'completed',
      createdAt: daysAgo(14),
    },
    {
      id: 'meeting-10',
      clubId: 'uplb-gavel-club',
      date: daysAgo(0), // Today
      theme: 'Looking Forward',
      wordOfTheDay: { word: 'Aspiration', definition: 'A hope or ambition of achieving something', partOfSpeech: 'noun', exampleSentence: 'Her aspiration is to become a great leader.' },
      idiomOfTheDay: { idiom: 'Shoot for the stars', meaning: 'To aim for something ambitious', exampleSentence: 'Always shoot for the stars in your goals.' },
      roles: {
        toastmaster: UPLB_MEMBERS.franco,
        generalEvaluator: UPLB_MEMBERS.euri,
        timer: UPLB_MEMBERS.jamie,
        ahCounter: UPLB_MEMBERS.jedd,
        grammarian: UPLB_MEMBERS.jenelle,
        topicsmaster: UPLB_MEMBERS.juleana,
        speakers: [
          { id: 's19', memberId: UPLB_MEMBERS.matt, speechTitle: 'Vision for Tomorrow', speechProject: 'CC7', pathway: 'Visionary Communication', duration: 7 },
          { id: 's20', memberId: UPLB_MEMBERS.sheena, speechTitle: 'Goals That Drive Us', speechProject: 'CC2', pathway: 'Dynamic Leadership', duration: 6 },
        ],
        evaluators: [
          { id: 'e19', memberId: UPLB_MEMBERS.rimple, speakerSlotId: 's19' },
          { id: 'e20', memberId: UPLB_MEMBERS.kasandra, speakerSlotId: 's20' },
        ],
        tableTopicsSpeakers: [
          { id: 'tt19', memberId: UPLB_MEMBERS.simonee, topic: 'Where do you see yourself in 5 years?', type: 'impromptu' },
          { id: 'tt20', memberId: UPLB_MEMBERS.aj, topic: 'Your New Year resolution', type: 'impromptu' },
        ],
      },
      status: 'in-progress',
      createdAt: daysAgo(7),
    },
  ],
  // Timer Sessions for completed meetings (9 meetings with 2 speakers each + table topics)
  timerSessions: [
    {
      id: 'timer-1', meetingId: 'meeting-1', createdAt: daysAgo(63),
      entries: [
        { id: 't1-1', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', role: 'speaker', speechType: 'Ice Breaker', greenTime: 240, yellowTime: 300, redTime: 360, maxTime: 420, actualTime: 365, status: 'completed' },
        { id: 't1-2', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', role: 'speaker', speechType: 'CC2', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 410, status: 'completed' },
        { id: 't1-3', memberId: UPLB_MEMBERS.euri, memberName: 'Euri Berces', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 165, status: 'completed' },
        { id: 't1-4', memberId: UPLB_MEMBERS.franco, memberName: 'Franco Miguel Andrade', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 175, status: 'completed' },
        { id: 't1-5', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 95, status: 'completed' },
        { id: 't1-6', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 110, status: 'completed' },
      ]
    },
    {
      id: 'timer-2', meetingId: 'meeting-2', createdAt: daysAgo(56),
      entries: [
        { id: 't2-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', role: 'speaker', speechType: 'CC3', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 395, status: 'completed' },
        { id: 't2-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', role: 'speaker', speechType: 'CC1', greenTime: 240, yellowTime: 300, redTime: 360, maxTime: 420, actualTime: 310, status: 'completed' },
        { id: 't2-3', memberId: UPLB_MEMBERS.matt, memberName: 'Matt Howell Mirasol Cantela', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 155, status: 'completed' },
        { id: 't2-4', memberId: UPLB_MEMBERS.rimple, memberName: 'Rimple Monreal', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 170, status: 'completed' },
        { id: 't2-5', memberId: UPLB_MEMBERS.sheena, memberName: 'Sheena Tumon', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 85, status: 'completed' },
        { id: 't2-6', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 100, status: 'completed' },
      ]
    },
    {
      id: 'timer-3', meetingId: 'meeting-3', createdAt: daysAgo(49),
      entries: [
        { id: 't3-1', memberId: UPLB_MEMBERS.euri, memberName: 'Euri Berces', role: 'speaker', speechType: 'CC4', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 380, status: 'completed' },
        { id: 't3-2', memberId: UPLB_MEMBERS.franco, memberName: 'Franco Miguel Andrade', role: 'speaker', speechType: 'CC5', greenTime: 360, yellowTime: 420, redTime: 480, maxTime: 540, actualTime: 465, status: 'completed' },
        { id: 't3-3', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 160, status: 'completed' },
        { id: 't3-4', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 145, status: 'completed' },
        { id: 't3-5', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 105, status: 'completed' },
        { id: 't3-6', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 115, status: 'completed' },
      ]
    },
    {
      id: 'timer-4', meetingId: 'meeting-4', createdAt: daysAgo(42),
      entries: [
        { id: 't4-1', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', role: 'speaker', speechType: 'CC6', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 400, status: 'completed' },
        { id: 't4-2', memberId: UPLB_MEMBERS.jedd, memberName: 'Jedd Pearl de Leon', role: 'speaker', speechType: 'CC2', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 355, status: 'completed' },
        { id: 't4-3', memberId: UPLB_MEMBERS.jenelle, memberName: 'Jenelle Allyza Pamatmat', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 168, status: 'completed' },
        { id: 't4-4', memberId: UPLB_MEMBERS.juleana, memberName: 'Juleana Marie Mendoza', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 152, status: 'completed' },
        { id: 't4-5', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 88, status: 'completed' },
        { id: 't4-6', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 92, status: 'completed' },
      ]
    },
    {
      id: 'timer-5', meetingId: 'meeting-5', createdAt: daysAgo(35),
      entries: [
        { id: 't5-1', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', role: 'speaker', speechType: 'Ice Breaker', greenTime: 240, yellowTime: 300, redTime: 360, maxTime: 420, actualTime: 320, status: 'completed' },
        { id: 't5-2', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', role: 'speaker', speechType: 'CC3', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 405, status: 'completed' },
        { id: 't5-3', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 172, status: 'completed' },
        { id: 't5-4', memberId: UPLB_MEMBERS.dave, memberName: 'Dave Solis', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 165, status: 'completed' },
        { id: 't5-5', memberId: UPLB_MEMBERS.jaymee, memberName: 'Jaymee Arcilla', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 98, status: 'completed' },
        { id: 't5-6', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 102, status: 'completed' },
      ]
    },
    {
      id: 'timer-6', meetingId: 'meeting-6', createdAt: daysAgo(28),
      entries: [
        { id: 't6-1', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', role: 'speaker', speechType: 'CC4', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 390, status: 'completed' },
        { id: 't6-2', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', role: 'speaker', speechType: 'CC2', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 375, status: 'completed' },
        { id: 't6-3', memberId: UPLB_MEMBERS.euri, memberName: 'Euri Berces', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 158, status: 'completed' },
        { id: 't6-4', memberId: UPLB_MEMBERS.franco, memberName: 'Franco Miguel Andrade', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 162, status: 'completed' },
        { id: 't6-5', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 95, status: 'completed' },
        { id: 't6-6', memberId: UPLB_MEMBERS.jedd, memberName: 'Jedd Pearl de Leon', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 108, status: 'completed' },
      ]
    },
    {
      id: 'timer-7', meetingId: 'meeting-7', createdAt: daysAgo(21),
      entries: [
        { id: 't7-1', memberId: UPLB_MEMBERS.jenelle, memberName: 'Jenelle Allyza Pamatmat', role: 'speaker', speechType: 'CC5', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 385, status: 'completed' },
        { id: 't7-2', memberId: UPLB_MEMBERS.juleana, memberName: 'Juleana Marie Mendoza', role: 'speaker', speechType: 'CC3', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 360, status: 'completed' },
        { id: 't7-3', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 170, status: 'completed' },
        { id: 't7-4', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 155, status: 'completed' },
        { id: 't7-5', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 90, status: 'completed' },
        { id: 't7-6', memberId: UPLB_MEMBERS.matt, memberName: 'Matt Howell Mirasol Cantela', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 105, status: 'completed' },
      ]
    },
    {
      id: 'timer-8', meetingId: 'meeting-8', createdAt: daysAgo(14),
      entries: [
        { id: 't8-1', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', role: 'speaker', speechType: 'CC6', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 410, status: 'completed' },
        { id: 't8-2', memberId: UPLB_MEMBERS.rimple, memberName: 'Rimple Monreal', role: 'speaker', speechType: 'CC1', greenTime: 240, yellowTime: 300, redTime: 360, maxTime: 420, actualTime: 305, status: 'completed' },
        { id: 't8-3', memberId: UPLB_MEMBERS.sheena, memberName: 'Sheena Tumon', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 165, status: 'completed' },
        { id: 't8-4', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 175, status: 'completed' },
        { id: 't8-5', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 100, status: 'completed' },
        { id: 't8-6', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 112, status: 'completed' },
      ]
    },
    {
      id: 'timer-9', meetingId: 'meeting-9', createdAt: daysAgo(7),
      entries: [
        { id: 't9-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', role: 'speaker', speechType: 'CC4', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 365, status: 'completed' },
        { id: 't9-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', role: 'speaker', speechType: 'CC3', greenTime: 300, yellowTime: 360, redTime: 420, maxTime: 450, actualTime: 395, status: 'completed' },
        { id: 't9-3', memberId: UPLB_MEMBERS.matt, memberName: 'Matt Howell Mirasol Cantela', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 160, status: 'completed' },
        { id: 't9-4', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', role: 'evaluator', speechType: 'Evaluation', greenTime: 120, yellowTime: 150, redTime: 180, maxTime: 210, actualTime: 168, status: 'completed' },
        { id: 't9-5', memberId: UPLB_MEMBERS.dave, memberName: 'Dave Solis', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 95, status: 'completed' },
        { id: 't9-6', memberId: UPLB_MEMBERS.jaymee, memberName: 'Jaymee Arcilla', role: 'table-topics', speechType: 'Table Topics', greenTime: 60, yellowTime: 90, redTime: 120, maxTime: 150, actualTime: 88, status: 'completed' },
      ]
    },
  ],
  // Ah Counter Sessions
  ahCounterSessions: [
    {
      id: 'ah-1', meetingId: 'meeting-1', createdAt: daysAgo(63),
      entries: [
        { id: 'ah1-1', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', fillerWords: [{ word: 'um', count: 3 }, { word: 'uh', count: 2 }], totalCount: 5 },
        { id: 'ah1-2', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', fillerWords: [{ word: 'so', count: 4 }, { word: 'like', count: 2 }], totalCount: 6 },
        { id: 'ah1-3', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', fillerWords: [{ word: 'um', count: 1 }], totalCount: 1 },
        { id: 'ah1-4', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', fillerWords: [{ word: 'uh', count: 2 }], totalCount: 2 },
      ]
    },
    {
      id: 'ah-2', meetingId: 'meeting-2', createdAt: daysAgo(56),
      entries: [
        { id: 'ah2-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', fillerWords: [{ word: 'um', count: 2 }, { word: 'so', count: 3 }], totalCount: 5 },
        { id: 'ah2-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', fillerWords: [{ word: 'like', count: 4 }], totalCount: 4 },
        { id: 'ah2-3', memberId: UPLB_MEMBERS.sheena, memberName: 'Sheena Tumon', fillerWords: [], totalCount: 0 },
        { id: 'ah2-4', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', fillerWords: [{ word: 'um', count: 1 }], totalCount: 1 },
      ]
    },
    {
      id: 'ah-3', meetingId: 'meeting-3', createdAt: daysAgo(49),
      entries: [
        { id: 'ah3-1', memberId: UPLB_MEMBERS.euri, memberName: 'Euri Berces', fillerWords: [{ word: 'uh', count: 2 }], totalCount: 2 },
        { id: 'ah3-2', memberId: UPLB_MEMBERS.franco, memberName: 'Franco Miguel Andrade', fillerWords: [{ word: 'so', count: 5 }, { word: 'um', count: 3 }], totalCount: 8 },
        { id: 'ah3-3', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', fillerWords: [], totalCount: 0 },
        { id: 'ah3-4', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', fillerWords: [{ word: 'like', count: 2 }], totalCount: 2 },
      ]
    },
    {
      id: 'ah-4', meetingId: 'meeting-4', createdAt: daysAgo(42),
      entries: [
        { id: 'ah4-1', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', fillerWords: [{ word: 'um', count: 1 }], totalCount: 1 },
        { id: 'ah4-2', memberId: UPLB_MEMBERS.jedd, memberName: 'Jedd Pearl de Leon', fillerWords: [{ word: 'uh', count: 3 }, { word: 'so', count: 2 }], totalCount: 5 },
        { id: 'ah4-3', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', fillerWords: [{ word: 'like', count: 1 }], totalCount: 1 },
        { id: 'ah4-4', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', fillerWords: [], totalCount: 0 },
      ]
    },
    {
      id: 'ah-5', meetingId: 'meeting-5', createdAt: daysAgo(35),
      entries: [
        { id: 'ah5-1', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', fillerWords: [{ word: 'um', count: 4 }, { word: 'uh', count: 2 }], totalCount: 6 },
        { id: 'ah5-2', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', fillerWords: [{ word: 'so', count: 2 }], totalCount: 2 },
        { id: 'ah5-3', memberId: UPLB_MEMBERS.jaymee, memberName: 'Jaymee Arcilla', fillerWords: [], totalCount: 0 },
        { id: 'ah5-4', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', fillerWords: [{ word: 'like', count: 3 }], totalCount: 3 },
      ]
    },
    {
      id: 'ah-6', meetingId: 'meeting-6', createdAt: daysAgo(28),
      entries: [
        { id: 'ah6-1', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', fillerWords: [{ word: 'um', count: 2 }], totalCount: 2 },
        { id: 'ah6-2', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', fillerWords: [{ word: 'uh', count: 1 }, { word: 'so', count: 1 }], totalCount: 2 },
        { id: 'ah6-3', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', fillerWords: [], totalCount: 0 },
        { id: 'ah6-4', memberId: UPLB_MEMBERS.jedd, memberName: 'Jedd Pearl de Leon', fillerWords: [{ word: 'like', count: 2 }], totalCount: 2 },
      ]
    },
    {
      id: 'ah-7', meetingId: 'meeting-7', createdAt: daysAgo(21),
      entries: [
        { id: 'ah7-1', memberId: UPLB_MEMBERS.jenelle, memberName: 'Jenelle Allyza Pamatmat', fillerWords: [{ word: 'um', count: 3 }], totalCount: 3 },
        { id: 'ah7-2', memberId: UPLB_MEMBERS.juleana, memberName: 'Juleana Marie Mendoza', fillerWords: [{ word: 'so', count: 2 }, { word: 'uh', count: 1 }], totalCount: 3 },
        { id: 'ah7-3', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', fillerWords: [], totalCount: 0 },
        { id: 'ah7-4', memberId: UPLB_MEMBERS.matt, memberName: 'Matt Howell Mirasol Cantela', fillerWords: [{ word: 'like', count: 1 }], totalCount: 1 },
      ]
    },
    {
      id: 'ah-8', meetingId: 'meeting-8', createdAt: daysAgo(14),
      entries: [
        { id: 'ah8-1', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', fillerWords: [{ word: 'um', count: 2 }, { word: 'so', count: 1 }], totalCount: 3 },
        { id: 'ah8-2', memberId: UPLB_MEMBERS.rimple, memberName: 'Rimple Monreal', fillerWords: [{ word: 'uh', count: 4 }], totalCount: 4 },
        { id: 'ah8-3', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', fillerWords: [], totalCount: 0 },
        { id: 'ah8-4', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', fillerWords: [{ word: 'like', count: 1 }], totalCount: 1 },
      ]
    },
    {
      id: 'ah-9', meetingId: 'meeting-9', createdAt: daysAgo(7),
      entries: [
        { id: 'ah9-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', fillerWords: [{ word: 'um', count: 1 }], totalCount: 1 },
        { id: 'ah9-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', fillerWords: [{ word: 'so', count: 2 }], totalCount: 2 },
        { id: 'ah9-3', memberId: UPLB_MEMBERS.dave, memberName: 'Dave Solis', fillerWords: [], totalCount: 0 },
        { id: 'ah9-4', memberId: UPLB_MEMBERS.jaymee, memberName: 'Jaymee Arcilla', fillerWords: [{ word: 'uh', count: 1 }], totalCount: 1 },
      ]
    },
  ],
  // Grammarian Sessions
  grammarianSessions: [
    {
      id: 'gram-1', meetingId: 'meeting-1', wordOfTheDay: 'Resilience', createdAt: daysAgo(63),
      entries: [
        { id: 'g1-1', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', type: 'word-of-day-usage', content: 'Used "resilience" naturally in context', timestamp: daysAgo(63) },
        { id: 'g1-2', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', type: 'good-usage', content: 'Excellent use of metaphors', timestamp: daysAgo(63) },
        { id: 'g1-3', memberId: UPLB_MEMBERS.james, memberName: 'James Nicholas Valdez', type: 'notable-phrase', content: '"The journey of a thousand miles begins with a single step"', timestamp: daysAgo(63) },
      ]
    },
    {
      id: 'gram-2', meetingId: 'meeting-2', wordOfTheDay: 'Tenacity', createdAt: daysAgo(56),
      entries: [
        { id: 'g2-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', type: 'word-of-day-usage', content: 'Incorporated "tenacity" twice in speech', timestamp: daysAgo(56) },
        { id: 'g2-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', type: 'grammar-error', content: 'Subject-verb agreement issue: "The team were" should be "The team was"', timestamp: daysAgo(56) },
        { id: 'g2-3', memberId: UPLB_MEMBERS.sheena, memberName: 'Sheena Tumon', type: 'good-usage', content: 'Great vocabulary range', timestamp: daysAgo(56) },
      ]
    },
    {
      id: 'gram-3', meetingId: 'meeting-3', wordOfTheDay: 'Eloquent', createdAt: daysAgo(49),
      entries: [
        { id: 'g3-1', memberId: UPLB_MEMBERS.euri, memberName: 'Euri Berces', type: 'notable-phrase', content: '"Words are the architects of our reality"', timestamp: daysAgo(49) },
        { id: 'g3-2', memberId: UPLB_MEMBERS.franco, memberName: 'Franco Miguel Andrade', type: 'word-of-day-usage', content: 'Used "eloquent" to describe effective communication', timestamp: daysAgo(49) },
        { id: 'g3-3', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', type: 'good-usage', content: 'Smooth transitions between points', timestamp: daysAgo(49) },
      ]
    },
    {
      id: 'gram-4', meetingId: 'meeting-4', wordOfTheDay: 'Ingenuity', createdAt: daysAgo(42),
      entries: [
        { id: 'g4-1', memberId: UPLB_MEMBERS.jomar, memberName: 'Jomar C. Garcia', type: 'word-of-day-usage', content: 'Excellent use of "ingenuity" in context', timestamp: daysAgo(42) },
        { id: 'g4-2', memberId: UPLB_MEMBERS.jedd, memberName: 'Jedd Pearl de Leon', type: 'notable-phrase', content: '"Innovation is the bridge between imagination and reality"', timestamp: daysAgo(42) },
      ]
    },
    {
      id: 'gram-5', meetingId: 'meeting-5', wordOfTheDay: 'Assurance', createdAt: daysAgo(35),
      entries: [
        { id: 'g5-1', memberId: UPLB_MEMBERS.simonee, memberName: 'Simonee Ezekiel', type: 'word-of-day-usage', content: 'Used "assurance" effectively', timestamp: daysAgo(35) },
        { id: 'g5-2', memberId: UPLB_MEMBERS.kasandra, memberName: 'Kasandra Martinez', type: 'good-usage', content: 'Strong opening hook', timestamp: daysAgo(35) },
        { id: 'g5-3', memberId: UPLB_MEMBERS.angela, memberName: 'Angela Eunice Umandap', type: 'notable-phrase', content: '"Confidence is not about being right, but about being willing to learn"', timestamp: daysAgo(35) },
      ]
    },
    {
      id: 'gram-6', meetingId: 'meeting-6', wordOfTheDay: 'Captivate', createdAt: daysAgo(28),
      entries: [
        { id: 'g6-1', memberId: UPLB_MEMBERS.ataram, memberName: 'Ataram Gabriel', type: 'word-of-day-usage', content: 'Masterfully used "captivate" to describe storytelling', timestamp: daysAgo(28) },
        { id: 'g6-2', memberId: UPLB_MEMBERS.jamie, memberName: 'Jamie', type: 'notable-phrase', content: '"Stories are the threads that weave the fabric of humanity"', timestamp: daysAgo(28) },
      ]
    },
    {
      id: 'gram-7', meetingId: 'meeting-7', wordOfTheDay: 'Diligence', createdAt: daysAgo(21),
      entries: [
        { id: 'g7-1', memberId: UPLB_MEMBERS.jenelle, memberName: 'Jenelle Allyza Pamatmat', type: 'word-of-day-usage', content: 'Used "diligence" in career context', timestamp: daysAgo(21) },
        { id: 'g7-2', memberId: UPLB_MEMBERS.juleana, memberName: 'Juleana Marie Mendoza', type: 'good-usage', content: 'Excellent parallel structure', timestamp: daysAgo(21) },
        { id: 'g7-3', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', type: 'grammar-error', content: 'Dangling modifier in opening sentence', timestamp: daysAgo(21) },
      ]
    },
    {
      id: 'gram-8', meetingId: 'meeting-8', wordOfTheDay: 'Adaptable', createdAt: daysAgo(14),
      entries: [
        { id: 'g8-1', memberId: UPLB_MEMBERS.karen, memberName: 'Karen Velasco', type: 'word-of-day-usage', content: 'Incorporated "adaptable" seamlessly', timestamp: daysAgo(14) },
        { id: 'g8-2', memberId: UPLB_MEMBERS.rimple, memberName: 'Rimple Monreal', type: 'notable-phrase', content: '"Change is the only constant, embrace it"', timestamp: daysAgo(14) },
      ]
    },
    {
      id: 'gram-9', meetingId: 'meeting-9', wordOfTheDay: 'Triumph', createdAt: daysAgo(7),
      entries: [
        { id: 'g9-1', memberId: UPLB_MEMBERS.lei, memberName: 'Lei John', type: 'word-of-day-usage', content: 'Beautiful use of "triumph" in conclusion', timestamp: daysAgo(7) },
        { id: 'g9-2', memberId: UPLB_MEMBERS.mary, memberName: 'Mary Rose Mendizabal', type: 'good-usage', content: 'Strong emotional appeal', timestamp: daysAgo(7) },
        { id: 'g9-3', memberId: UPLB_MEMBERS.dave, memberName: 'Dave Solis', type: 'notable-phrase', content: '"Success is not final, failure is not fatal"', timestamp: daysAgo(7) },
      ]
    },
  ],
  // Evaluation Sessions
  evaluationSessions: [
    {
      id: 'eval-1', meetingId: 'meeting-1', createdAt: daysAgo(63),
      evaluations: [
        {
          id: 'ev1-1', evaluatorId: UPLB_MEMBERS.euri, evaluatorName: 'Euri Berces', speakerId: UPLB_MEMBERS.angela, speakerName: 'Angela Eunice Umandap', speechTitle: 'Finding My Voice',
          strengths: [{ id: 's1', category: 'Content', description: 'Very personal and relatable story' }, { id: 's2', category: 'Delivery', description: 'Great eye contact with audience' }],
          improvements: [{ id: 'i1', category: 'Structure', description: 'Could have a stronger conclusion' }],
          overallComments: 'Excellent first speech! Your authenticity really shone through.',
          ratings: { clarity: 4, vocalVariety: 4, eyeContact: 5, gestures: 3, bodyLanguage: 4, enthusiasm: 5, structure: 3, content: 5, audienceConnection: 5, timeManagement: 4 },
          createdAt: daysAgo(63)
        },
        {
          id: 'ev1-2', evaluatorId: UPLB_MEMBERS.franco, evaluatorName: 'Franco Miguel Andrade', speakerId: UPLB_MEMBERS.ataram, speakerName: 'Ataram Gabriel', speechTitle: 'The Power of Stories',
          strengths: [{ id: 's3', category: 'Delivery', description: 'Excellent vocal variety and pacing' }, { id: 's4', category: 'Content', description: 'Engaging examples' }],
          improvements: [{ id: 'i2', category: 'Gestures', description: 'Use more purposeful hand gestures' }],
          overallComments: 'Great storytelling skills! Keep developing your stage presence.',
          ratings: { clarity: 5, vocalVariety: 5, eyeContact: 4, gestures: 3, bodyLanguage: 4, enthusiasm: 5, structure: 4, content: 5, audienceConnection: 4, timeManagement: 4 },
          createdAt: daysAgo(63)
        }
      ]
    },
    {
      id: 'eval-2', meetingId: 'meeting-2', createdAt: daysAgo(56),
      evaluations: [
        {
          id: 'ev2-1', evaluatorId: UPLB_MEMBERS.matt, evaluatorName: 'Matt Howell Mirasol Cantela', speakerId: UPLB_MEMBERS.lei, speakerName: 'Lei John', speechTitle: 'Leading with Empathy',
          strengths: [{ id: 's5', category: 'Content', description: 'Well-researched topic with strong examples' }],
          improvements: [{ id: 'i3', category: 'Delivery', description: 'Vary your pace more' }, { id: 'i4', category: 'Body Language', description: 'Move around the stage more' }],
          overallComments: 'Solid speech with great insights on leadership.',
          ratings: { clarity: 4, vocalVariety: 3, eyeContact: 4, gestures: 3, bodyLanguage: 3, enthusiasm: 4, structure: 5, content: 5, audienceConnection: 4, timeManagement: 4 },
          createdAt: daysAgo(56)
        },
        {
          id: 'ev2-2', evaluatorId: UPLB_MEMBERS.rimple, evaluatorName: 'Rimple Monreal', speakerId: UPLB_MEMBERS.mary, speakerName: 'Mary Rose Mendizabal', speechTitle: 'My Leadership Journey',
          strengths: [{ id: 's6', category: 'Authenticity', description: 'Very genuine and heartfelt delivery' }, { id: 's7', category: 'Eye Contact', description: 'Maintained great connection with audience' }],
          improvements: [{ id: 'i5', category: 'Time', description: 'Practice to hit the green zone' }],
          overallComments: 'Your passion for the topic was evident!',
          ratings: { clarity: 4, vocalVariety: 4, eyeContact: 5, gestures: 4, bodyLanguage: 4, enthusiasm: 5, structure: 4, content: 4, audienceConnection: 5, timeManagement: 3 },
          createdAt: daysAgo(56)
        }
      ]
    },
    {
      id: 'eval-3', meetingId: 'meeting-3', createdAt: daysAgo(49),
      evaluations: [
        {
          id: 'ev3-1', evaluatorId: UPLB_MEMBERS.james, evaluatorName: 'James Nicholas Valdez', speakerId: UPLB_MEMBERS.euri, speakerName: 'Euri Berces', speechTitle: 'Words That Matter',
          strengths: [{ id: 's8', category: 'Vocabulary', description: 'Rich and varied word choice' }, { id: 's9', category: 'Structure', description: 'Clear three-point structure' }],
          improvements: [{ id: 'i6', category: 'Gestures', description: 'Match gestures to your words' }],
          overallComments: 'Eloquent speech that demonstrated mastery of language.',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 4, gestures: 3, bodyLanguage: 4, enthusiasm: 4, structure: 5, content: 5, audienceConnection: 4, timeManagement: 4 },
          createdAt: daysAgo(49)
        },
        {
          id: 'ev3-2', evaluatorId: UPLB_MEMBERS.jamie, evaluatorName: 'Jamie', speakerId: UPLB_MEMBERS.franco, speakerName: 'Franco Miguel Andrade', speechTitle: 'The Art of Persuasion',
          strengths: [{ id: 's10', category: 'Content', description: 'Compelling arguments with evidence' }, { id: 's11', category: 'Call to Action', description: 'Strong and memorable conclusion' }],
          improvements: [{ id: 'i7', category: 'Pacing', description: 'Slow down during key points' }],
          overallComments: 'Very persuasive! You had the audience convinced.',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 5, gestures: 4, bodyLanguage: 5, enthusiasm: 5, structure: 5, content: 5, audienceConnection: 5, timeManagement: 5 },
          createdAt: daysAgo(49)
        }
      ]
    },
    {
      id: 'eval-4', meetingId: 'meeting-4', createdAt: daysAgo(42),
      evaluations: [
        {
          id: 'ev4-1', evaluatorId: UPLB_MEMBERS.jenelle, evaluatorName: 'Jenelle Allyza Pamatmat', speakerId: UPLB_MEMBERS.jomar, speakerName: 'Jomar C. Garcia', speechTitle: 'Innovate or Stagnate',
          strengths: [{ id: 's12', category: 'Examples', description: 'Great real-world examples of innovation' }, { id: 's13', category: 'Confidence', description: 'Commanding stage presence' }],
          improvements: [{ id: 'i8', category: 'Visuals', description: 'Consider using visual aids next time' }],
          overallComments: 'Inspiring speech that motivated everyone to think differently.',
          ratings: { clarity: 5, vocalVariety: 5, eyeContact: 5, gestures: 5, bodyLanguage: 5, enthusiasm: 5, structure: 5, content: 5, audienceConnection: 5, timeManagement: 4 },
          createdAt: daysAgo(42)
        },
        {
          id: 'ev4-2', evaluatorId: UPLB_MEMBERS.juleana, evaluatorName: 'Juleana Marie Mendoza', speakerId: UPLB_MEMBERS.jedd, speakerName: 'Jedd Pearl de Leon', speechTitle: 'Creative Problem Solving',
          strengths: [{ id: 's14', category: 'Creativity', description: 'Unique perspective on the topic' }],
          improvements: [{ id: 'i9', category: 'Volume', description: 'Project your voice more' }, { id: 'i10', category: 'Eye Contact', description: 'Look at all sections of the room' }],
          overallComments: 'Great content, keep building your confidence!',
          ratings: { clarity: 4, vocalVariety: 3, eyeContact: 3, gestures: 3, bodyLanguage: 3, enthusiasm: 4, structure: 4, content: 5, audienceConnection: 3, timeManagement: 4 },
          createdAt: daysAgo(42)
        }
      ]
    },
    {
      id: 'eval-5', meetingId: 'meeting-5', createdAt: daysAgo(35),
      evaluations: [
        {
          id: 'ev5-1', evaluatorId: UPLB_MEMBERS.jomar, evaluatorName: 'Jomar C. Garcia', speakerId: UPLB_MEMBERS.simonee, speakerName: 'Simonee Ezekiel', speechTitle: 'Overcoming Stage Fright',
          strengths: [{ id: 's15', category: 'Relatability', description: 'Topic resonated with many audience members' }, { id: 's16', category: 'Honesty', description: 'Brave to share personal struggles' }],
          improvements: [{ id: 'i11', category: 'Filler Words', description: 'Work on reducing um and uh' }],
          overallComments: 'Courageous first speech! You showed great potential.',
          ratings: { clarity: 4, vocalVariety: 3, eyeContact: 4, gestures: 3, bodyLanguage: 3, enthusiasm: 4, structure: 4, content: 5, audienceConnection: 5, timeManagement: 3 },
          createdAt: daysAgo(35)
        },
        {
          id: 'ev5-2', evaluatorId: UPLB_MEMBERS.dave, evaluatorName: 'Dave Solis', speakerId: UPLB_MEMBERS.kasandra, speakerName: 'Kasandra Martinez', speechTitle: 'Confidence is Key',
          strengths: [{ id: 's17', category: 'Delivery', description: 'Practiced and polished delivery' }, { id: 's18', category: 'Vocal Variety', description: 'Great use of pauses for effect' }],
          improvements: [{ id: 'i12', category: 'Movement', description: 'Use the stage more' }],
          overallComments: 'You exemplified confidence in your delivery!',
          ratings: { clarity: 5, vocalVariety: 5, eyeContact: 5, gestures: 4, bodyLanguage: 4, enthusiasm: 5, structure: 5, content: 4, audienceConnection: 5, timeManagement: 4 },
          createdAt: daysAgo(35)
        }
      ]
    },
    {
      id: 'eval-6', meetingId: 'meeting-6', createdAt: daysAgo(28),
      evaluations: [
        {
          id: 'ev6-1', evaluatorId: UPLB_MEMBERS.euri, evaluatorName: 'Euri Berces', speakerId: UPLB_MEMBERS.ataram, speakerName: 'Ataram Gabriel', speechTitle: 'Stories That Inspire',
          strengths: [{ id: 's19', category: 'Storytelling', description: 'Masterful story arc with emotional peaks' }, { id: 's20', category: 'Voice', description: 'Different voices for characters' }],
          improvements: [{ id: 'i13', category: 'Time', description: 'Slightly over time' }],
          overallComments: 'You had us captivated from start to finish!',
          ratings: { clarity: 5, vocalVariety: 5, eyeContact: 5, gestures: 5, bodyLanguage: 5, enthusiasm: 5, structure: 5, content: 5, audienceConnection: 5, timeManagement: 3 },
          createdAt: daysAgo(28)
        },
        {
          id: 'ev6-2', evaluatorId: UPLB_MEMBERS.franco, evaluatorName: 'Franco Miguel Andrade', speakerId: UPLB_MEMBERS.jamie, speakerName: 'Jamie', speechTitle: 'My Life in Three Acts',
          strengths: [{ id: 's21', category: 'Structure', description: 'Creative three-act structure' }, { id: 's22', category: 'Humor', description: 'Well-placed humor' }],
          improvements: [{ id: 'i14', category: 'Transitions', description: 'Smoother transitions between acts' }],
          overallComments: 'Entertaining and insightful speech!',
          ratings: { clarity: 4, vocalVariety: 4, eyeContact: 4, gestures: 4, bodyLanguage: 4, enthusiasm: 5, structure: 4, content: 5, audienceConnection: 4, timeManagement: 4 },
          createdAt: daysAgo(28)
        }
      ]
    },
    {
      id: 'eval-7', meetingId: 'meeting-7', createdAt: daysAgo(21),
      evaluations: [
        {
          id: 'ev7-1', evaluatorId: UPLB_MEMBERS.karen, evaluatorName: 'Karen Velasco', speakerId: UPLB_MEMBERS.jenelle, speakerName: 'Jenelle Allyza Pamatmat', speechTitle: 'Career Lessons',
          strengths: [{ id: 's23', category: 'Expertise', description: 'Spoke with authority on the subject' }, { id: 's24', category: 'Actionable', description: 'Practical tips audience can use' }],
          improvements: [{ id: 'i15', category: 'Energy', description: 'Increase energy in the middle section' }],
          overallComments: 'Valuable insights for anyone in their career journey.',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 5, gestures: 4, bodyLanguage: 4, enthusiasm: 4, structure: 5, content: 5, audienceConnection: 4, timeManagement: 4 },
          createdAt: daysAgo(21)
        },
        {
          id: 'ev7-2', evaluatorId: UPLB_MEMBERS.lei, evaluatorName: 'Lei John', speakerId: UPLB_MEMBERS.juleana, speakerName: 'Juleana Marie Mendoza', speechTitle: 'The Growth Mindset',
          strengths: [{ id: 's25', category: 'Research', description: 'Well-researched with credible sources' }],
          improvements: [{ id: 'i16', category: 'Personal Stories', description: 'Add more personal anecdotes' }, { id: 'i17', category: 'Engagement', description: 'Ask rhetorical questions' }],
          overallComments: 'Educational speech that taught us all something new.',
          ratings: { clarity: 4, vocalVariety: 3, eyeContact: 4, gestures: 3, bodyLanguage: 3, enthusiasm: 4, structure: 5, content: 5, audienceConnection: 3, timeManagement: 4 },
          createdAt: daysAgo(21)
        }
      ]
    },
    {
      id: 'eval-8', meetingId: 'meeting-8', createdAt: daysAgo(14),
      evaluations: [
        {
          id: 'ev8-1', evaluatorId: UPLB_MEMBERS.sheena, evaluatorName: 'Sheena Tumon', speakerId: UPLB_MEMBERS.karen, speakerName: 'Karen Velasco', speechTitle: 'Change is the Only Constant',
          strengths: [{ id: 's26', category: 'Opening', description: 'Powerful hook that grabbed attention' }, { id: 's27', category: 'Flow', description: 'Smooth and logical flow of ideas' }],
          improvements: [{ id: 'i18', category: 'Closing', description: 'Tie back to the opening' }],
          overallComments: 'Thought-provoking speech on an important topic.',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 5, gestures: 4, bodyLanguage: 4, enthusiasm: 5, structure: 4, content: 5, audienceConnection: 5, timeManagement: 4 },
          createdAt: daysAgo(14)
        },
        {
          id: 'ev8-2', evaluatorId: UPLB_MEMBERS.simonee, evaluatorName: 'Simonee Ezekiel', speakerId: UPLB_MEMBERS.rimple, speakerName: 'Rimple Monreal', speechTitle: 'My Transformation Story',
          strengths: [{ id: 's28', category: 'Vulnerability', description: 'Shared personal journey courageously' }],
          improvements: [{ id: 'i19', category: 'Filler Words', description: 'Reduce use of "uh"' }, { id: 'i20', category: 'Pace', description: 'Vary your speaking pace' }],
          overallComments: 'Inspiring personal story that touched many hearts.',
          ratings: { clarity: 4, vocalVariety: 3, eyeContact: 4, gestures: 3, bodyLanguage: 3, enthusiasm: 5, structure: 4, content: 5, audienceConnection: 5, timeManagement: 3 },
          createdAt: daysAgo(14)
        }
      ]
    },
    {
      id: 'eval-9', meetingId: 'meeting-9', createdAt: daysAgo(7),
      evaluations: [
        {
          id: 'ev9-1', evaluatorId: UPLB_MEMBERS.matt, evaluatorName: 'Matt Howell Mirasol Cantela', speakerId: UPLB_MEMBERS.lei, speakerName: 'Lei John', speechTitle: 'Celebrating Small Wins',
          strengths: [{ id: 's29', category: 'Message', description: 'Uplifting and motivating message' }, { id: 's30', category: 'Examples', description: 'Relatable examples from daily life' }],
          improvements: [{ id: 'i21', category: 'Gestures', description: 'More emphatic gestures for key points' }],
          overallComments: 'Left everyone feeling positive and motivated!',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 5, gestures: 3, bodyLanguage: 4, enthusiasm: 5, structure: 5, content: 5, audienceConnection: 5, timeManagement: 4 },
          createdAt: daysAgo(7)
        },
        {
          id: 'ev9-2', evaluatorId: UPLB_MEMBERS.jomar, evaluatorName: 'Jomar C. Garcia', speakerId: UPLB_MEMBERS.mary, speakerName: 'Mary Rose Mendizabal', speechTitle: 'The Journey to Success',
          strengths: [{ id: 's31', category: 'Improvement', description: 'Noticeable improvement from first speech' }, { id: 's32', category: 'Confidence', description: 'Much more confident delivery' }],
          improvements: [{ id: 'i22', category: 'Vocal Variety', description: 'Experiment with volume changes' }],
          overallComments: 'Tremendous growth! Keep up the great work.',
          ratings: { clarity: 5, vocalVariety: 4, eyeContact: 5, gestures: 4, bodyLanguage: 5, enthusiasm: 5, structure: 5, content: 5, audienceConnection: 5, timeManagement: 5 },
          createdAt: daysAgo(7)
        }
      ]
    },
  ],
  speechRecordings: [],
};

// In-memory database (for serverless environments like Vercel)
// This will reset on cold starts, but works for demo purposes
let database: Database = { ...defaultDatabase };

// Initialize from localStorage on client side
export function initializeDatabase(): Database {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('toastmasters-db');
    if (stored) {
      try {
        database = JSON.parse(stored);
      } catch {
        database = { ...defaultDatabase };
        localStorage.setItem('toastmasters-db', JSON.stringify(database));
      }
    } else {
      localStorage.setItem('toastmasters-db', JSON.stringify(defaultDatabase));
    }
  }
  return database;
}

// Save to localStorage
function saveDatabase(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('toastmasters-db', JSON.stringify(database));
  }
}

// Club operations
export function getClubs(): Club[] {
  initializeDatabase();
  return database.clubs;
}

export function getClub(id: string): Club | undefined {
  initializeDatabase();
  return database.clubs.find(c => c.id === id);
}

export function createClub(club: Omit<Club, 'id' | 'createdAt'>): Club {
  initializeDatabase();
  const newClub: Club = {
    ...club,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.clubs.push(newClub);
  saveDatabase();
  return newClub;
}

export function updateClub(id: string, updates: Partial<Club>): Club | null {
  initializeDatabase();
  const index = database.clubs.findIndex(c => c.id === id);
  if (index === -1) return null;
  database.clubs[index] = { ...database.clubs[index], ...updates };
  saveDatabase();
  return database.clubs[index];
}

export function deleteClub(id: string): boolean {
  initializeDatabase();
  const index = database.clubs.findIndex(c => c.id === id);
  if (index === -1) return false;
  database.clubs.splice(index, 1);
  // Also delete related data
  database.members = database.members.filter(m => m.clubId !== id);
  database.meetings = database.meetings.filter(m => m.clubId !== id);
  saveDatabase();
  return true;
}

// Member operations
export function getMembers(clubId?: string): Member[] {
  initializeDatabase();
  if (clubId) {
    return database.members.filter(m => m.clubId === clubId);
  }
  return database.members;
}

export function getMember(id: string): Member | undefined {
  initializeDatabase();
  return database.members.find(m => m.id === id);
}

export function createMember(member: Omit<Member, 'id' | 'joinedAt'>): Member {
  initializeDatabase();
  const newMember: Member = {
    ...member,
    id: uuidv4(),
    joinedAt: new Date().toISOString(),
  };
  database.members.push(newMember);
  saveDatabase();
  return newMember;
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  initializeDatabase();
  const index = database.members.findIndex(m => m.id === id);
  if (index === -1) return null;
  database.members[index] = { ...database.members[index], ...updates };
  saveDatabase();
  return database.members[index];
}

export function deleteMember(id: string): boolean {
  initializeDatabase();
  const index = database.members.findIndex(m => m.id === id);
  if (index === -1) return false;
  database.members.splice(index, 1);
  saveDatabase();
  return true;
}

// Meeting operations
export function getMeetings(clubId?: string): Meeting[] {
  initializeDatabase();
  if (clubId) {
    return database.meetings.filter(m => m.clubId === clubId);
  }
  return database.meetings;
}

export function getMeeting(id: string): Meeting | undefined {
  initializeDatabase();
  return database.meetings.find(m => m.id === id);
}

export function createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt'>): Meeting {
  initializeDatabase();
  const newMeeting: Meeting = {
    ...meeting,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.meetings.push(newMeeting);
  saveDatabase();
  return newMeeting;
}

export function updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
  initializeDatabase();
  const index = database.meetings.findIndex(m => m.id === id);
  if (index === -1) return null;
  database.meetings[index] = { ...database.meetings[index], ...updates };
  saveDatabase();
  return database.meetings[index];
}

export function deleteMeeting(id: string): boolean {
  initializeDatabase();
  const index = database.meetings.findIndex(m => m.id === id);
  if (index === -1) return false;
  database.meetings.splice(index, 1);
  saveDatabase();
  return true;
}

// Grammarian Session operations
export function getGrammarianSession(meetingId: string): GrammarianSession | undefined {
  initializeDatabase();
  return database.grammarianSessions.find(s => s.meetingId === meetingId);
}

export function createGrammarianSession(session: Omit<GrammarianSession, 'id' | 'createdAt'>): GrammarianSession {
  initializeDatabase();
  const newSession: GrammarianSession = {
    ...session,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.grammarianSessions.push(newSession);
  saveDatabase();
  return newSession;
}

export function updateGrammarianSession(id: string, updates: Partial<GrammarianSession>): GrammarianSession | null {
  initializeDatabase();
  const index = database.grammarianSessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  database.grammarianSessions[index] = { ...database.grammarianSessions[index], ...updates };
  saveDatabase();
  return database.grammarianSessions[index];
}

// Ah Counter Session operations
export function getAhCounterSession(meetingId: string): AhCounterSession | undefined {
  initializeDatabase();
  return database.ahCounterSessions.find(s => s.meetingId === meetingId);
}

export function createAhCounterSession(session: Omit<AhCounterSession, 'id' | 'createdAt'>): AhCounterSession {
  initializeDatabase();
  const newSession: AhCounterSession = {
    ...session,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.ahCounterSessions.push(newSession);
  saveDatabase();
  return newSession;
}

export function updateAhCounterSession(id: string, updates: Partial<AhCounterSession>): AhCounterSession | null {
  initializeDatabase();
  const index = database.ahCounterSessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  database.ahCounterSessions[index] = { ...database.ahCounterSessions[index], ...updates };
  saveDatabase();
  return database.ahCounterSessions[index];
}

// Timer Session operations
export function getTimerSession(meetingId: string): TimerSession | undefined {
  initializeDatabase();
  return database.timerSessions.find(s => s.meetingId === meetingId);
}

export function createTimerSession(session: Omit<TimerSession, 'id' | 'createdAt'>): TimerSession {
  initializeDatabase();
  const newSession: TimerSession = {
    ...session,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.timerSessions.push(newSession);
  saveDatabase();
  return newSession;
}

export function updateTimerSession(id: string, updates: Partial<TimerSession>): TimerSession | null {
  initializeDatabase();
  const index = database.timerSessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  database.timerSessions[index] = { ...database.timerSessions[index], ...updates };
  saveDatabase();
  return database.timerSessions[index];
}

// Evaluation Session operations
export function getEvaluationSession(meetingId: string): EvaluationSession | undefined {
  initializeDatabase();
  return database.evaluationSessions.find(s => s.meetingId === meetingId);
}

export function createEvaluationSession(session: Omit<EvaluationSession, 'id' | 'createdAt'>): EvaluationSession {
  initializeDatabase();
  const newSession: EvaluationSession = {
    ...session,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.evaluationSessions.push(newSession);
  saveDatabase();
  return newSession;
}

export function updateEvaluationSession(id: string, updates: Partial<EvaluationSession>): EvaluationSession | null {
  initializeDatabase();
  const index = database.evaluationSessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  database.evaluationSessions[index] = { ...database.evaluationSessions[index], ...updates };
  saveDatabase();
  return database.evaluationSessions[index];
}

// Reset database to default
export function resetDatabase(): void {
  database = { ...defaultDatabase };
  saveDatabase();
}

// Export full database (for backup)
export function exportDatabase(): Database {
  initializeDatabase();
  return database;
}

// Export database as text/JSON string
export function exportDatabaseAsText(): string {
  initializeDatabase();
  return JSON.stringify(database, null, 2);
}

// Import database from text/JSON string
export function importDatabaseFromText(text: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(text) as Database;
    // Validate structure
    if (!data.clubs || !data.members || !data.meetings) {
      return { success: false, error: 'Invalid database structure: missing required fields' };
    }
    if (!Array.isArray(data.clubs) || !Array.isArray(data.members) || !Array.isArray(data.meetings)) {
      return { success: false, error: 'Invalid database structure: fields must be arrays' };
    }
    // Ensure all arrays exist
    data.grammarianSessions = data.grammarianSessions || [];
    data.ahCounterSessions = data.ahCounterSessions || [];
    data.timerSessions = data.timerSessions || [];
    
    database = data;
    saveDatabase();
    return { success: true };
  } catch (e) {
    return { success: false, error: `Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

// Import database (for restore)
export function importDatabase(data: Database): void {
  database = data;
  saveDatabase();
}

// Get member performance stats
export function getMemberPerformanceStats(memberId: string): MemberPerformanceStats | null {
  initializeDatabase();
  const member = database.members.find(m => m.id === memberId);
  if (!member) return null;

  // Get all sessions involving this member
  const timerEntries = database.timerSessions.flatMap(s => 
    s.entries.filter(e => e.memberId === memberId)
  );
  const ahCounterEntries = database.ahCounterSessions.flatMap(s => 
    s.entries.filter(e => e.memberId === memberId)
  );
  const grammarianEntries = database.grammarianSessions.flatMap(s => 
    s.entries.filter(e => e.memberId === memberId)
  );

  // Get all evaluations where this member was the speaker
  const evaluationsReceived = database.evaluationSessions.flatMap(s =>
    s.evaluations.filter(e => e.speakerId === memberId)
  );

  // Calculate stats
  const speeches = timerEntries.filter(e => e.role === 'speaker');
  const tableTopics = timerEntries.filter(e => e.role === 'table-topics');
  const evaluations = timerEntries.filter(e => e.role === 'evaluator');

  const totalFillerWords = ahCounterEntries.reduce((sum, e) => sum + e.totalCount, 0);
  const avgFillerWords = ahCounterEntries.length > 0 ? totalFillerWords / ahCounterEntries.length : 0;

  // Filler word trend (last 10)
  const fillerWordTrend = ahCounterEntries.slice(-10).map(e => e.totalCount);

  // Timing stats
  const completedSpeeches = speeches.filter(e => e.actualTime !== undefined);
  const avgSpeechTime = completedSpeeches.length > 0 
    ? completedSpeeches.reduce((sum, e) => sum + (e.actualTime || 0), 0) / completedSpeeches.length 
    : 0;
  
  const onTimeSpeeches = completedSpeeches.filter(e => 
    e.actualTime !== undefined && e.actualTime >= e.greenTime && e.actualTime <= e.maxTime
  );
  const timingAccuracy = completedSpeeches.length > 0 
    ? (onTimeSpeeches.length / completedSpeeches.length) * 100 
    : 0;

  // Grammar stats
  const grammarErrors = grammarianEntries.filter(e => e.type === 'grammar-error');
  const wordOfDayUsage = grammarianEntries.filter(e => e.type === 'word-of-day-usage');
  const goodPhrases = grammarianEntries.filter(e => e.type === 'good-usage' || e.type === 'notable-phrase');

  const totalSpeechCount = speeches.length + tableTopics.length;
  const errorsPerSpeech = totalSpeechCount > 0 ? grammarErrors.length / totalSpeechCount : 0;

  // Meetings attended (unique meeting IDs from timer sessions)
  const meetingIds = new Set(database.timerSessions
    .filter(s => s.entries.some(e => e.memberId === memberId))
    .map(s => s.meetingId)
  );

  // Evaluation stats - ratings received
  const ratingCategories = ['clarity', 'vocalVariety', 'eyeContact', 'gestures', 'bodyLanguage', 
                            'enthusiasm', 'structure', 'content', 'audienceConnection', 'timeManagement'] as const;
  
  const ratingBreakdown: MemberPerformanceStats['ratingBreakdown'] = {
    clarity: 0, vocalVariety: 0, eyeContact: 0, gestures: 0, bodyLanguage: 0,
    enthusiasm: 0, structure: 0, content: 0, audienceConnection: 0, timeManagement: 0,
  };

  let totalRatingSum = 0;
  let totalRatingCount = 0;

  evaluationsReceived.forEach(ev => {
    if (ev.ratings) {
      ratingCategories.forEach(cat => {
        const value = ev.ratings[cat];
        if (value > 0) {
          ratingBreakdown[cat] = (ratingBreakdown[cat] * totalRatingCount + value) / (totalRatingCount + 1);
          totalRatingSum += value;
          totalRatingCount++;
        }
      });
    }
  });

  // Calculate overall average rating
  const avgRating = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;

  // Round all rating values
  ratingCategories.forEach(cat => {
    ratingBreakdown[cat] = Math.round(ratingBreakdown[cat] * 10) / 10;
  });

  // Collect strengths and improvements from evaluations
  const strengthsMap: Record<string, number> = {};
  const improvementsMap: Record<string, number> = {};

  evaluationsReceived.forEach(ev => {
    ev.strengths.forEach(s => {
      const key = s.description.toLowerCase().trim();
      strengthsMap[key] = (strengthsMap[key] || 0) + 1;
    });
    ev.improvements.forEach(i => {
      const key = i.description.toLowerCase().trim();
      improvementsMap[key] = (improvementsMap[key] || 0) + 1;
    });
  });

  // Sort and get top 5
  const topStrengths = Object.entries(strengthsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key]) => key);

  const areasForImprovement = Object.entries(improvementsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key]) => key);

  return {
    memberId,
    memberName: member.name,
    clubId: member.clubId,
    totalSpeeches: speeches.length,
    totalTableTopics: tableTopics.length,
    totalEvaluations: evaluations.length,
    averageFillerWords: Math.round(avgFillerWords * 10) / 10,
    fillerWordTrend,
    averageSpeechTime: Math.round(avgSpeechTime),
    timingAccuracy: Math.round(timingAccuracy),
    grammarErrorsPerSpeech: Math.round(errorsPerSpeech * 10) / 10,
    wordOfDayUsageCount: wordOfDayUsage.length,
    goodPhrasesCount: goodPhrases.length,
    meetingsAttended: meetingIds.size,
    evaluationsReceived: evaluationsReceived.length,
    averageRating: Math.round(avgRating * 10) / 10,
    ratingBreakdown,
    topStrengths,
    areasForImprovement,
  };
}

// Get all members' performance for a club
export function getClubPerformanceStats(clubId: string): MemberPerformanceStats[] {
  initializeDatabase();
  const members = database.members.filter(m => m.clubId === clubId);
  return members
    .map(m => getMemberPerformanceStats(m.id))
    .filter((stats): stats is MemberPerformanceStats => stats !== null);
}

// Speech Recording operations
export function getSpeechRecordings(): SpeechRecording[] {
  initializeDatabase();
  return database.speechRecordings || [];
}

export function getSpeechRecordingsByMember(memberId: string): SpeechRecording[] {
  initializeDatabase();
  return (database.speechRecordings || []).filter(r => r.memberId === memberId);
}

export function getSpeechRecordingsByMeeting(meetingId: string): SpeechRecording[] {
  initializeDatabase();
  return (database.speechRecordings || []).filter(r => r.meetingId === meetingId);
}

export function getSpeechRecording(id: string): SpeechRecording | undefined {
  initializeDatabase();
  return (database.speechRecordings || []).find(r => r.id === id);
}

export function createSpeechRecording(recording: Omit<SpeechRecording, 'id' | 'createdAt'>): SpeechRecording {
  initializeDatabase();
  if (!database.speechRecordings) {
    database.speechRecordings = [];
  }
  const newRecording: SpeechRecording = {
    ...recording,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  database.speechRecordings.push(newRecording);
  saveDatabase();
  return newRecording;
}

export function updateSpeechRecording(id: string, updates: Partial<SpeechRecording>): SpeechRecording | null {
  initializeDatabase();
  if (!database.speechRecordings) return null;
  const index = database.speechRecordings.findIndex(r => r.id === id);
  if (index === -1) return null;
  database.speechRecordings[index] = { ...database.speechRecordings[index], ...updates };
  saveDatabase();
  return database.speechRecordings[index];
}

export function deleteSpeechRecording(id: string): boolean {
  initializeDatabase();
  if (!database.speechRecordings) return false;
  const index = database.speechRecordings.findIndex(r => r.id === id);
  if (index === -1) return false;
  database.speechRecordings.splice(index, 1);
  saveDatabase();
  return true;
}