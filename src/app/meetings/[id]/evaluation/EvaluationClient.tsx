// src/app/meetings/[id]/evaluation/EvaluationClient.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouteParam } from '@/lib/utils/route-params';
import { Meeting, Member, EvaluationSession, Evaluation, EvaluationPoint, SpeakerSlot } from '@/lib/types';
import { getMeeting, getMembers, getEvaluationSession, createEvaluationSession, updateEvaluationSession } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Maximize2,
  Minimize2,
  ThumbsUp,
  AlertCircle,
  Star,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const RATING_LABELS = {
  clarity: 'Clarity',
  vocalVariety: 'Vocal Variety',
  eyeContact: 'Eye Contact',
  gestures: 'Gestures',
  bodyLanguage: 'Body Language',
  enthusiasm: 'Enthusiasm',
  structure: 'Structure',
  content: 'Content Quality',
  audienceConnection: 'Audience Connection',
  timeManagement: 'Time Management',
};

const CATEGORY_LABELS: Record<string, string> = {
  content: 'Content',
  delivery: 'Delivery',
  language: 'Language',
  structure: 'Structure',
  impact: 'Impact',
};

export default function EvaluationClient() {
  const meetingId = useRouteParam(1);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newEvalForm, setNewEvalForm] = useState({
    evaluatorId: '',
    speakerId: '',
    speechTitle: '',
  });

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const loadData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      setMembers(getMembers(meetingData.clubId));
      
      let evalSession = getEvaluationSession(meetingId);
      if (!evalSession) {
        evalSession = createEvaluationSession({
          meetingId,
          evaluations: [],
        });
      }
      setSession(evalSession);
    }
  };

  const saveSession = useCallback((evaluations: Evaluation[]) => {
    if (session) {
      const updated = updateEvaluationSession(session.id, { evaluations });
      if (updated) setSession(updated);
    }
  }, [session]);

  const handleCreateEvaluation = () => {
    if (!newEvalForm.evaluatorId || !newEvalForm.speakerId || !session) return;

    const evaluator = members.find(m => m.id === newEvalForm.evaluatorId);
    const speaker = members.find(m => m.id === newEvalForm.speakerId);
    if (!evaluator || !speaker) return;

    const newEval: Evaluation = {
      id: uuidv4(),
      evaluatorId: evaluator.id,
      evaluatorName: evaluator.name,
      speakerId: speaker.id,
      speakerName: speaker.name,
      speechTitle: newEvalForm.speechTitle || 'Untitled Speech',
      strengths: [],
      improvements: [],
      overallComments: '',
      ratings: {
        clarity: 3,
        vocalVariety: 3,
        eyeContact: 3,
        gestures: 3,
        bodyLanguage: 3,
        enthusiasm: 3,
        structure: 3,
        content: 3,
        audienceConnection: 3,
        timeManagement: 3,
      },
      createdAt: new Date().toISOString(),
    };

    const updatedEvaluations = [...session.evaluations, newEval];
    saveSession(updatedEvaluations);
    setSelectedEvaluation(newEval);
    setShowNewDialog(false);
    setNewEvalForm({ evaluatorId: '', speakerId: '', speechTitle: '' });
  };

  const updateEvaluation = (evalId: string, updates: Partial<Evaluation>) => {
    if (!session) return;
    
    const updatedEvaluations = session.evaluations.map(e =>
      e.id === evalId ? { ...e, ...updates } : e
    );
    saveSession(updatedEvaluations);
    
    if (selectedEvaluation?.id === evalId) {
      setSelectedEvaluation(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addPoint = (evalId: string, type: 'strengths' | 'improvements') => {
    if (!session) return;

    const newPoint: EvaluationPoint = {
      id: uuidv4(),
      category: 'content',
      description: '',
      example: '',
    };

    const updatedEvaluations = session.evaluations.map(e => {
      if (e.id !== evalId) return e;
      return {
        ...e,
        [type]: [...e[type], newPoint],
      };
    });
    saveSession(updatedEvaluations);
    
    if (selectedEvaluation?.id === evalId) {
      setSelectedEvaluation(prev => prev ? {
        ...prev,
        [type]: [...prev[type], newPoint],
      } : null);
    }
  };

  const updatePoint = (evalId: string, type: 'strengths' | 'improvements', pointId: string, updates: Partial<EvaluationPoint>) => {
    if (!session) return;

    const updatedEvaluations = session.evaluations.map(e => {
      if (e.id !== evalId) return e;
      return {
        ...e,
        [type]: e[type].map(p => p.id === pointId ? { ...p, ...updates } : p),
      };
    });
    saveSession(updatedEvaluations);
    
    if (selectedEvaluation?.id === evalId) {
      setSelectedEvaluation(prev => prev ? {
        ...prev,
        [type]: prev[type].map(p => p.id === pointId ? { ...p, ...updates } : p),
      } : null);
    }
  };

  const removePoint = (evalId: string, type: 'strengths' | 'improvements', pointId: string) => {
    if (!session) return;

    const updatedEvaluations = session.evaluations.map(e => {
      if (e.id !== evalId) return e;
      return {
        ...e,
        [type]: e[type].filter(p => p.id !== pointId),
      };
    });
    saveSession(updatedEvaluations);
    
    if (selectedEvaluation?.id === evalId) {
      setSelectedEvaluation(prev => prev ? {
        ...prev,
        [type]: prev[type].filter(p => p.id !== pointId),
      } : null);
    }
  };

  const deleteEvaluation = (evalId: string) => {
    if (!session || !confirm('Are you sure you want to delete this evaluation?')) return;
    
    const updatedEvaluations = session.evaluations.filter(e => e.id !== evalId);
    saveSession(updatedEvaluations);
    
    if (selectedEvaluation?.id === evalId) {
      setSelectedEvaluation(null);
    }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

  const getAverageRating = (ratings: Evaluation['ratings']) => {
    const values = Object.values(ratings);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#772432]">Meeting not found</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/meetings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meetings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isPresentationMode && selectedEvaluation) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white overflow-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={() => setPresentationMode(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-[#c4a052] text-lg px-4 py-1 mb-4">Speech Evaluation</Badge>
            <h1 className="text-4xl font-bold mb-2">{selectedEvaluation.speechTitle}</h1>
            <p className="text-xl text-white/80">by {selectedEvaluation.speakerName}</p>
            <p className="text-white/60 mt-2">Evaluated by {selectedEvaluation.evaluatorName}</p>
          </div>

          {/* Overall Rating */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 bg-white/10 rounded-full px-8 py-4">
              <Star className="h-8 w-8 text-[#c4a052] fill-[#c4a052]" />
              <span className="text-5xl font-bold">{getAverageRating(selectedEvaluation.ratings)}</span>
              <span className="text-2xl text-white/60">/5</span>
            </div>
          </div>

          {/* Commend - Recommend - Commend */}
          <div className="grid gap-8 md:grid-cols-2 mb-12">
            {/* Strengths */}
            <Card className="bg-green-500/20 border-green-500/40">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  What Worked Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvaluation.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedEvaluation.strengths.map((point) => (
                      <li key={point.id} className="text-white">
                        <Badge variant="outline" className="mr-2 border-green-500/50 text-green-300">
                          {CATEGORY_LABELS[point.category] || point.category}
                        </Badge>
                        <span className="font-medium">{point.description}</span>
                        {point.example && (
                          <p className="text-white/60 text-sm mt-1 ml-4 italic">&quot;{point.example}&quot;</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/60">No specific strengths noted</p>
                )}
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="bg-yellow-500/20 border-yellow-500/40">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-400">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Areas for Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvaluation.improvements.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedEvaluation.improvements.map((point) => (
                      <li key={point.id} className="text-white">
                        <Badge variant="outline" className="mr-2 border-yellow-500/50 text-yellow-300">
                          {CATEGORY_LABELS[point.category] || point.category}
                        </Badge>
                        <span className="font-medium">{point.description}</span>
                        {point.example && (
                          <p className="text-white/60 text-sm mt-1 ml-4 italic">&quot;{point.example}&quot;</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/60">No specific improvements noted</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ratings Grid */}
          <Card className="bg-white/10 border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Detailed Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(selectedEvaluation.ratings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <span className="text-white/80">{RATING_LABELS[key as keyof typeof RATING_LABELS]}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= value ? 'text-[#c4a052] fill-[#c4a052]' : 'text-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Comments */}
          {selectedEvaluation.overallComments && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Overall Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg leading-relaxed">{selectedEvaluation.overallComments}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2">
            <Link href={`/meetings/${meetingId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meeting
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#772432]">Evaluations</h1>
          <p className="text-muted-foreground">{meeting.theme}</p>
        </div>
        
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-[#772432] hover:bg-[#8f3a48]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evaluations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>All Evaluations</CardTitle>
              <CardDescription>
                {session?.evaluations.length || 0} evaluations recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session?.evaluations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No evaluations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {session?.evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEvaluation?.id === evaluation.id
                          ? 'bg-[#772432] text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <p className="font-medium">{evaluation.speechTitle}</p>
                      <p className={`text-sm ${selectedEvaluation?.id === evaluation.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {evaluation.speakerName} → {evaluation.evaluatorName}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className={`h-3 w-3 mr-1 ${selectedEvaluation?.id === evaluation.id ? 'text-[#c4a052]' : 'text-[#c4a052]'}`} />
                        <span className="text-xs">{getAverageRating(evaluation.ratings)}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Editor */}
        <div className="lg:col-span-2">
          {selectedEvaluation ? (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{selectedEvaluation.speechTitle}</CardTitle>
                  <CardDescription>
                    Speaker: {selectedEvaluation.speakerName} | Evaluator: {selectedEvaluation.evaluatorName}
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setPresentationMode(true)}
                    className="bg-[#c4a052] hover:bg-[#a88939] text-black flex-1 sm:flex-none"
                  >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Present
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteEvaluation(selectedEvaluation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="feedback" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="feedback" className="space-y-6">
                    {/* Strengths */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="flex items-center text-green-600">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Commend (Strengths)
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPoint(selectedEvaluation.id, 'strengths')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedEvaluation.strengths.map((point) => (
                        <div key={point.id} className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex gap-2 mb-2">
                            <Select
                              value={point.category}
                              onValueChange={(value: EvaluationPoint['category']) => 
                                updatePoint(selectedEvaluation.id, 'strengths', point.id, { category: value })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={point.description}
                              onChange={(e) => updatePoint(selectedEvaluation.id, 'strengths', point.id, { description: e.target.value })}
                              placeholder="What did they do well?"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePoint(selectedEvaluation.id, 'strengths', point.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            value={point.example || ''}
                            onChange={(e) => updatePoint(selectedEvaluation.id, 'strengths', point.id, { example: e.target.value })}
                            placeholder="Example from the speech (optional)"
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Improvements */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="flex items-center text-yellow-600">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Recommend (Areas for Growth)
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPoint(selectedEvaluation.id, 'improvements')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedEvaluation.improvements.map((point) => (
                        <div key={point.id} className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex gap-2 mb-2">
                            <Select
                              value={point.category}
                              onValueChange={(value: EvaluationPoint['category']) => 
                                updatePoint(selectedEvaluation.id, 'improvements', point.id, { category: value })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={point.description}
                              onChange={(e) => updatePoint(selectedEvaluation.id, 'improvements', point.id, { description: e.target.value })}
                              placeholder="What could be improved?"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePoint(selectedEvaluation.id, 'improvements', point.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            value={point.example || ''}
                            onChange={(e) => updatePoint(selectedEvaluation.id, 'improvements', point.id, { example: e.target.value })}
                            placeholder="Specific suggestion (optional)"
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Overall Comments */}
                    <div>
                      <Label className="flex items-center mb-2">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Overall Comments
                      </Label>
                      <Textarea
                        value={selectedEvaluation.overallComments}
                        onChange={(e) => updateEvaluation(selectedEvaluation.id, { overallComments: e.target.value })}
                        placeholder="Any additional feedback or encouragement..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ratings" className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Rate each aspect from 1 (needs work) to 5 (excellent)
                    </p>
                    {Object.entries(RATING_LABELS).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{label}</Label>
                          <span className="font-medium">{selectedEvaluation.ratings[key as keyof typeof RATING_LABELS]}/5</span>
                        </div>
                        <Slider
                          value={[selectedEvaluation.ratings[key as keyof typeof RATING_LABELS]]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={([value]) => {
                            updateEvaluation(selectedEvaluation.id, {
                              ratings: { ...selectedEvaluation.ratings, [key]: value },
                            });
                          }}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  Select an evaluation from the list or create a new one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Evaluation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#772432]">New Evaluation</DialogTitle>
            <DialogDescription>
              Create a new speech evaluation using the Toastmasters method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Speaker</Label>
              <Select
                value={newEvalForm.speakerId || '__none__'}
                onValueChange={(value) => setNewEvalForm(prev => ({
                  ...prev,
                  speakerId: value === '__none__' ? '' : value,
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select speaker</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Evaluator</Label>
              <Select
                value={newEvalForm.evaluatorId || '__none__'}
                onValueChange={(value) => setNewEvalForm(prev => ({
                  ...prev,
                  evaluatorId: value === '__none__' ? '' : value,
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select evaluator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select evaluator</SelectItem>
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
                value={newEvalForm.speechTitle}
                onChange={(e) => setNewEvalForm(prev => ({ ...prev, speechTitle: e.target.value }))}
                placeholder="Enter speech title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvaluation}
              disabled={!newEvalForm.evaluatorId || !newEvalForm.speakerId}
              className="bg-[#772432] hover:bg-[#8f3a48]"
            >
              Create Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
