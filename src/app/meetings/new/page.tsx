// src/app/meetings/new/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Club, Member, SpeakerSlot, TableTopicsSpeakerSlot, EvaluatorSlot, TIMER_PRESETS } from '@/lib/types';
import { getClubs, getMembers, createMeeting } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Calendar, Save, Plus, Trash2, Mic, MessageSquare, UserCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function NewMeetingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClubId = searchParams.get('clubId');

  const [clubs, setClubs] = useState<Club[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    clubId: preselectedClubId || '',
    date: '',
    theme: '',
    wordOfTheDay: {
      word: '',
      definition: '',
      partOfSpeech: '',
      exampleSentence: '',
    },
    idiomOfTheDay: {
      idiom: '',
      meaning: '',
      exampleSentence: '',
    },
    roles: {
      toastmaster: '',
      generalEvaluator: '',
      timer: '',
      ahCounter: '',
      grammarian: '',
      topicsmaster: '',
      speakers: [] as SpeakerSlot[],
      evaluators: [] as EvaluatorSlot[],
      tableTopicsSpeakers: [] as TableTopicsSpeakerSlot[],
    },
  });

  // Add a new speaker slot
  const addSpeaker = () => {
    const newSpeaker: SpeakerSlot = {
      id: uuidv4(),
      memberId: '',
      speechTitle: '',
      speechProject: '',
      pathway: '',
      level: '',
      greenTime: 300,
      yellowTime: 360,
      redTime: 420,
      maxTime: 450,
    };
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        speakers: [...prev.roles.speakers, newSpeaker],
      },
    }));
  };

  // Remove a speaker slot
  const removeSpeaker = (id: string) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        speakers: prev.roles.speakers.filter(s => s.id !== id),
        evaluators: prev.roles.evaluators.filter(e => e.speakerId !== id),
      },
    }));
  };

  // Update a speaker slot
  const updateSpeaker = (id: string, updates: Partial<SpeakerSlot>) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        speakers: prev.roles.speakers.map(s => s.id === id ? { ...s, ...updates } : s),
      },
    }));
  };

  // Add a table topics speaker
  const addTableTopicsSpeaker = () => {
    const newTTS: TableTopicsSpeakerSlot = {
      id: uuidv4(),
      memberId: '',
      topic: '',
    };
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        tableTopicsSpeakers: [...prev.roles.tableTopicsSpeakers, newTTS],
      },
    }));
  };

  // Remove a table topics speaker
  const removeTableTopicsSpeaker = (id: string) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        tableTopicsSpeakers: prev.roles.tableTopicsSpeakers.filter(s => s.id !== id),
      },
    }));
  };

  // Add an evaluator
  const addEvaluator = (speakerId: string) => {
    const newEval: EvaluatorSlot = {
      id: uuidv4(),
      evaluatorId: '',
      speakerId,
    };
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        evaluators: [...prev.roles.evaluators, newEval],
      },
    }));
  };

  useEffect(() => {
    // Set date on client-side to avoid hydration mismatch
    setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    
    const clubsList = getClubs();
    setClubs(clubsList);
    
    if (preselectedClubId) {
      setFormData(prev => ({ ...prev, clubId: preselectedClubId }));
      setMembers(getMembers(preselectedClubId));
    }
  }, [preselectedClubId]);

  useEffect(() => {
    if (formData.clubId) {
      setMembers(getMembers(formData.clubId));
    }
  }, [formData.clubId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clubId || !formData.date) {
      alert('Please select a club and date');
      return;
    }

    const meeting = createMeeting({
      clubId: formData.clubId,
      date: formData.date,
      theme: formData.theme,
      wordOfTheDay: formData.wordOfTheDay,
      idiomOfTheDay: formData.idiomOfTheDay,
      roles: formData.roles,
      status: 'scheduled',
    });

    router.push(`/meetings/${meeting.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/meetings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#772432]">Schedule New Meeting</h1>
          <p className="text-muted-foreground">
            Plan your Toastmasters meeting with all the essential details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up the meeting date and theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="club">Club *</Label>
                  <Select
                    value={formData.clubId}
                    onValueChange={(value) => setFormData({ ...formData, clubId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Meeting Theme</Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g., New Year, New Goals"
                />
              </div>
            </CardContent>
          </Card>

          {/* Word of the Day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#c4a052]">Word of the Day</CardTitle>
              <CardDescription>
                Choose an interesting word for members to use during the meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="word">Word</Label>
                  <Input
                    id="word"
                    value={formData.wordOfTheDay.word}
                    onChange={(e) => setFormData({
                      ...formData,
                      wordOfTheDay: { ...formData.wordOfTheDay, word: e.target.value }
                    })}
                    placeholder="e.g., Eloquent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Part of Speech</Label>
                  <Input
                    id="partOfSpeech"
                    value={formData.wordOfTheDay.partOfSpeech}
                    onChange={(e) => setFormData({
                      ...formData,
                      wordOfTheDay: { ...formData.wordOfTheDay, partOfSpeech: e.target.value }
                    })}
                    placeholder="e.g., Adjective"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="definition">Definition</Label>
                <Textarea
                  id="definition"
                  value={formData.wordOfTheDay.definition}
                  onChange={(e) => setFormData({
                    ...formData,
                    wordOfTheDay: { ...formData.wordOfTheDay, definition: e.target.value }
                  })}
                  placeholder="Enter the word's definition"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wordExample">Example Sentence</Label>
                <Textarea
                  id="wordExample"
                  value={formData.wordOfTheDay.exampleSentence}
                  onChange={(e) => setFormData({
                    ...formData,
                    wordOfTheDay: { ...formData.wordOfTheDay, exampleSentence: e.target.value }
                  })}
                  placeholder="Use the word in a sentence"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Idiom of the Day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#004165]">Idiom of the Day</CardTitle>
              <CardDescription>
                Share an idiom to enrich members&apos; vocabulary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idiom">Idiom</Label>
                <Input
                  id="idiom"
                  value={formData.idiomOfTheDay.idiom}
                  onChange={(e) => setFormData({
                    ...formData,
                    idiomOfTheDay: { ...formData.idiomOfTheDay, idiom: e.target.value }
                  })}
                  placeholder="e.g., Break a leg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idiomMeaning">Meaning</Label>
                <Textarea
                  id="idiomMeaning"
                  value={formData.idiomOfTheDay.meaning}
                  onChange={(e) => setFormData({
                    ...formData,
                    idiomOfTheDay: { ...formData.idiomOfTheDay, meaning: e.target.value }
                  })}
                  placeholder="Explain what the idiom means"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idiomExample">Example Usage</Label>
                <Textarea
                  id="idiomExample"
                  value={formData.idiomOfTheDay.exampleSentence}
                  onChange={(e) => setFormData({
                    ...formData,
                    idiomOfTheDay: { ...formData.idiomOfTheDay, exampleSentence: e.target.value }
                  })}
                  placeholder="Use the idiom in a sentence"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Meeting Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Roles</CardTitle>
              <CardDescription>
                Assign members to their roles for the meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Toastmaster</Label>
                  <Select
                    value={formData.roles.toastmaster || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, toastmaster: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>General Evaluator</Label>
                  <Select
                    value={formData.roles.generalEvaluator || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, generalEvaluator: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timer</Label>
                  <Select
                    value={formData.roles.timer || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, timer: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ah Counter</Label>
                  <Select
                    value={formData.roles.ahCounter || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, ahCounter: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grammarian</Label>
                  <Select
                    value={formData.roles.grammarian || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, grammarian: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Table Topics Master</Label>
                  <Select
                    value={formData.roles.topicsmaster || '__none__'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      roles: { ...formData.roles, topicsmaster: value === '__none__' ? '' : value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prepared Speakers */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5 text-[#772432]" />
                  Prepared Speakers
                </CardTitle>
                <CardDescription>
                  Add speakers who will deliver prepared speeches
                </CardDescription>
              </div>
              <Button type="button" onClick={addSpeaker} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Speaker
              </Button>
            </CardHeader>
            <CardContent>
              {formData.roles.speakers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No speakers added yet. Click &quot;Add Speaker&quot; to add one.
                </p>
              ) : (
                <div className="space-y-6">
                  {formData.roles.speakers.map((speaker, index) => (
                    <div key={speaker.id} className="relative border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#772432]">Speaker {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpeaker(speaker.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Speaker</Label>
                          <Select
                            value={speaker.memberId || '__none__'}
                            onValueChange={(value) => updateSpeaker(speaker.id, { 
                              memberId: value === '__none__' ? '' : value 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not assigned</SelectItem>
                              {members.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Speech Title</Label>
                          <Input
                            value={speaker.speechTitle}
                            onChange={(e) => updateSpeaker(speaker.id, { speechTitle: e.target.value })}
                            placeholder="Enter speech title"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Pathway</Label>
                          <Select
                            value={speaker.pathway || '__none__'}
                            onValueChange={(value) => updateSpeaker(speaker.id, { 
                              pathway: value === '__none__' ? '' : value 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select pathway" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not specified</SelectItem>
                              <SelectItem value="dynamic-leadership">Dynamic Leadership</SelectItem>
                              <SelectItem value="effective-coaching">Effective Coaching</SelectItem>
                              <SelectItem value="innovative-planning">Innovative Planning</SelectItem>
                              <SelectItem value="leadership-development">Leadership Development</SelectItem>
                              <SelectItem value="motivational-strategies">Motivational Strategies</SelectItem>
                              <SelectItem value="persuasive-influence">Persuasive Influence</SelectItem>
                              <SelectItem value="presentation-mastery">Presentation Mastery</SelectItem>
                              <SelectItem value="strategic-relationships">Strategic Relationships</SelectItem>
                              <SelectItem value="team-collaboration">Team Collaboration</SelectItem>
                              <SelectItem value="visionary-communication">Visionary Communication</SelectItem>
                              <SelectItem value="engaging-humor">Engaging Humor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Level / Project</Label>
                          <Input
                            value={speaker.speechProject || ''}
                            onChange={(e) => updateSpeaker(speaker.id, { speechProject: e.target.value })}
                            placeholder="e.g., Level 1, Ice Breaker"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Duration (Timer Settings)</Label>
                          <Select
                            value={`${speaker.greenTime}-${speaker.yellowTime}-${speaker.redTime}`}
                            onValueChange={(value) => {
                              const preset = Object.entries(TIMER_PRESETS).find(
                                ([, p]) => `${p.green}-${p.yellow}-${p.red}` === value
                              );
                              if (preset) {
                                updateSpeaker(speaker.id, {
                                  greenTime: preset[1].green,
                                  yellowTime: preset[1].yellow,
                                  redTime: preset[1].red,
                                  maxTime: preset[1].max,
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
                                <SelectItem key={key} value={`${preset.green}-${preset.yellow}-${preset.red}`}>
                                  {preset.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Evaluator for this speaker */}
                      {!formData.roles.evaluators.some(e => e.speakerId === speaker.id) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addEvaluator(speaker.id)}
                          className="mt-2"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign Evaluator
                        </Button>
                      )}
                      
                      {formData.roles.evaluators
                        .filter(e => e.speakerId === speaker.id)
                        .map(evaluator => (
                          <div key={evaluator.id} className="mt-2 flex items-center gap-2 bg-muted p-2 rounded">
                            <UserCheck className="h-4 w-4 text-[#c4a052]" />
                            <Label className="w-20">Evaluator:</Label>
                            <Select
                              value={evaluator.evaluatorId || '__none__'}
                              onValueChange={(value) => {
                                setFormData(prev => ({
                                  ...prev,
                                  roles: {
                                    ...prev.roles,
                                    evaluators: prev.roles.evaluators.map(e =>
                                      e.id === evaluator.id ? { ...e, evaluatorId: value === '__none__' ? '' : value } : e
                                    ),
                                  },
                                }));
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select evaluator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Not assigned</SelectItem>
                                {members.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  roles: {
                                    ...prev.roles,
                                    evaluators: prev.roles.evaluators.filter(e => e.id !== evaluator.id),
                                  },
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Topics Speakers */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-[#004165]" />
                  Table Topics Speakers
                </CardTitle>
                <CardDescription>
                  Pre-assign members for impromptu speaking (optional)
                </CardDescription>
              </div>
              <Button type="button" onClick={addTableTopicsSpeaker} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Speaker
              </Button>
            </CardHeader>
            <CardContent>
              {formData.roles.tableTopicsSpeakers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No table topics speakers pre-assigned. You can add them during the meeting.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.roles.tableTopicsSpeakers.map((speaker, index) => (
                    <div key={speaker.id} className="flex items-center gap-3">
                      <span className="w-8 text-muted-foreground">{index + 1}.</span>
                      <Select
                        value={speaker.memberId || '__none__'}
                        onValueChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            roles: {
                              ...prev.roles,
                              tableTopicsSpeakers: prev.roles.tableTopicsSpeakers.map(s =>
                                s.id === speaker.id ? { ...s, memberId: value === '__none__' ? '' : value } : s
                              ),
                            },
                          }));
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not assigned</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTableTopicsSpeaker(speaker.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/meetings">Cancel</Link>
            </Button>
            <Button type="submit" className="bg-[#772432] hover:bg-[#8f3a48]">
              <Save className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <NewMeetingForm />
    </Suspense>
  );
}
