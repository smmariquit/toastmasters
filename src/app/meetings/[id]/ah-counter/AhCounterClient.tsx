// src/app/meetings/[id]/ah-counter/AhCounterClient.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouteParam } from '@/lib/utils/route-params';
import { Meeting, Member, AhCounterSession, AhCounterEntry, DEFAULT_FILLER_WORDS } from '@/lib/types';
import { getMeeting, getMembers, getAhCounterSession, createAhCounterSession, updateAhCounterSession } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Minus,
  RotateCcw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { WrappedPresentation, WrappedSlide } from '@/components/wrapped-presentation';

export default function AhCounterClient() {
  const meetingId = useRouteParam(1);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<AhCounterSession | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [isWrappedMode, setWrappedMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [fillerWords, setFillerWords] = useState<string[]>([...DEFAULT_FILLER_WORDS]);
  const [newFillerWord, setNewFillerWord] = useState('');

  // Derive selectedEntry from session state to always get latest values
  const selectedEntry = selectedEntryId ? session?.entries.find(e => e.id === selectedEntryId) || null : null;

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const loadData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      setMembers(getMembers(meetingData.clubId));
      
      let ahSession = getAhCounterSession(meetingId);
      if (!ahSession) {
        ahSession = createAhCounterSession({
          meetingId,
          entries: [],
        });
      }
      setSession(ahSession);
    }
  };

  const saveSession = useCallback((entries: AhCounterEntry[]) => {
    if (session) {
      const updated = updateAhCounterSession(session.id, { entries });
      if (updated) setSession(updated);
    }
  }, [session]);

  const handleAddMember = () => {
    if (!selectedMember || !session) return;
    
    const member = members.find(m => m.id === selectedMember);
    if (!member) return;

    // Check if member already exists
    if (session.entries.some(e => e.memberId === member.id)) {
      return;
    }

    const newEntry: AhCounterEntry = {
      id: uuidv4(),
      memberId: member.id,
      memberName: member.name,
      fillerWords: fillerWords.map(word => ({ word, count: 0 })),
      totalCount: 0,
    };

    const updatedEntries = [...session.entries, newEntry];
    saveSession(updatedEntries);
    setShowAddDialog(false);
    setSelectedMember('');
  };

  const handleIncrementFiller = (entryId: string, word: string) => {
    if (!session) return;

    const updatedEntries = session.entries.map(entry => {
      if (entry.id !== entryId) return entry;

      const updatedFillers = entry.fillerWords.map(f =>
        f.word === word ? { ...f, count: f.count + 1 } : f
      );
      
      // Add word if it doesn't exist
      if (!updatedFillers.some(f => f.word === word)) {
        updatedFillers.push({ word, count: 1 });
      }

      return {
        ...entry,
        fillerWords: updatedFillers,
        totalCount: updatedFillers.reduce((sum, f) => sum + f.count, 0),
      };
    });

    saveSession(updatedEntries);
  };

  const handleDecrementFiller = (entryId: string, word: string) => {
    if (!session) return;

    const updatedEntries = session.entries.map(entry => {
      if (entry.id !== entryId) return entry;

      const updatedFillers = entry.fillerWords.map(f =>
        f.word === word ? { ...f, count: Math.max(0, f.count - 1) } : f
      );

      return {
        ...entry,
        fillerWords: updatedFillers,
        totalCount: updatedFillers.reduce((sum, f) => sum + f.count, 0),
      };
    });

    saveSession(updatedEntries);
  };

  const handleResetEntry = (entryId: string) => {
    if (!session) return;

    const updatedEntries = session.entries.map(entry => {
      if (entry.id !== entryId) return entry;

      return {
        ...entry,
        fillerWords: entry.fillerWords.map(f => ({ ...f, count: 0 })),
        totalCount: 0,
      };
    });

    saveSession(updatedEntries);
  };

  const handleRemoveEntry = (entryId: string) => {
    if (!session) return;
    const updatedEntries = session.entries.filter(e => e.id !== entryId);
    saveSession(updatedEntries);
    if (selectedEntry?.id === entryId) {
      setSelectedEntryId(null);
    }
  };

  const handleAddFillerWord = () => {
    if (newFillerWord.trim() && !fillerWords.includes(newFillerWord.toLowerCase().trim())) {
      setFillerWords([...fillerWords, newFillerWord.toLowerCase().trim()]);
      setNewFillerWord('');
    }
  };

  const generateWrappedSlides = (): WrappedSlide[] => {
    if (!session || session.entries.length === 0) return [];

    const totalFillerWords = session.entries.reduce((sum, e) => sum + e.totalCount, 0);
    const avgFillerWords = session.entries.length > 0 
      ? Math.round(totalFillerWords / session.entries.length) 
      : 0;

    // Find most common filler words across all speakers
    const fillerTotals: Record<string, number> = {};
    session.entries.forEach(entry => {
      entry.fillerWords.forEach(f => {
        fillerTotals[f.word] = (fillerTotals[f.word] || 0) + f.count;
      });
    });
    const sortedFillers = Object.entries(fillerTotals)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);

    // Find cleanest speaker (least filler words)
    const cleanestSpeaker = session.entries.reduce((cleanest, current) => 
      current.totalCount < cleanest.totalCount ? current : cleanest
    );

    // Find most challenged speaker (most filler words)
    const mostFillers = session.entries.reduce((most, current) => 
      current.totalCount > most.totalCount ? current : most
    );

    // Speakers with no filler words
    const perfectSpeakers = session.entries.filter(e => e.totalCount === 0);

    const slides: WrappedSlide[] = [
      {
        type: 'intro',
        title: 'Filler Words Wrapped',
        subtitle: `Let's see how everyone did with filler words`,
        icon: 'message',
        color: 'gradient',
      },
      {
        type: 'stat',
        title: 'Total Filler Words',
        value: totalFillerWords,
        subtitle: `Across ${session.entries.length} speaker${session.entries.length !== 1 ? 's' : ''}`,
        color: totalFillerWords === 0 ? 'green' : 'gold',
      },
    ];

    if (session.entries.length > 0) {
      slides.push({
        type: 'stat',
        title: 'Average Per Speaker',
        value: avgFillerWords,
        unit: 'filler words',
        color: avgFillerWords <= 2 ? 'green' : avgFillerWords <= 5 ? 'gold' : 'red',
      });
    }

    if (sortedFillers.length > 0) {
      slides.push({
        type: 'highlight',
        title: 'Most Common Filler Word',
        value: `"${sortedFillers[0][0]}"`,
        subtitle: `Used ${sortedFillers[0][1]} time${sortedFillers[0][1] !== 1 ? 's' : ''}`,
        icon: 'trending',
        color: 'burgundy',
      });
    }

    if (sortedFillers.length > 1) {
      slides.push({
        type: 'list',
        title: 'Top Filler Words',
        items: sortedFillers.slice(0, 6).map(([word, count]) => ({
          label: word,
          value: count,
          highlight: word === sortedFillers[0][0],
        })),
        color: 'gold',
      });
    }

    if (perfectSpeakers.length > 0) {
      slides.push({
        type: 'list',
        title: '🌟 Perfect Speakers!',
        items: perfectSpeakers.map(s => ({
          label: s.memberName,
          value: '0 filler words',
          highlight: true,
        })),
        color: 'green',
      });
    } else if (cleanestSpeaker) {
      slides.push({
        type: 'highlight',
        title: 'Cleanest Speaker',
        value: cleanestSpeaker.memberName,
        subtitle: `Only ${cleanestSpeaker.totalCount} filler word${cleanestSpeaker.totalCount !== 1 ? 's' : ''}`,
        icon: 'star',
        color: 'green',
      });
    }

    if (mostFillers && mostFillers.totalCount > 0 && mostFillers.id !== cleanestSpeaker.id) {
      slides.push({
        type: 'highlight',
        title: 'Room for Improvement',
        value: mostFillers.memberName,
        subtitle: `${mostFillers.totalCount} filler words - keep practicing!`,
        icon: 'trending',
        color: 'navy',
      });
    }

    slides.push({
      type: 'list',
      title: 'All Speakers',
      items: session.entries
        .sort((a, b) => a.totalCount - b.totalCount)
        .map(e => ({
          label: e.memberName,
          value: e.totalCount,
          highlight: e.totalCount === 0,
        })),
      color: 'navy',
    });

    slides.push({
      type: 'summary',
      title: 'Meeting Summary',
      items: [
        { label: 'Speakers', value: session.entries.length },
        { label: 'Total Fillers', value: totalFillerWords },
        { label: 'Perfect Score', value: perfectSpeakers.length },
      ],
      subtitle: totalFillerWords === 0 ? 'Amazing! No filler words! 🏆' : 'Keep practicing! 💪',
      color: 'gradient',
    });

    return slides;
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

  if (isWrappedMode) {
    const slides = generateWrappedSlides();
    if (slides.length > 0) {
      return (
        <WrappedPresentation
          slides={slides}
          onClose={() => setWrappedMode(false)}
          title="Ah Counter Summary"
        />
      );
    }
    setWrappedMode(false);
  }

  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1a1a1a] text-white overflow-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={() => setPresentationMode(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#c4a052]">
            Ah Counter Report
          </h1>
          <p className="text-center text-xl mb-8">{meeting.theme}</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {session?.entries.map((entry) => (
              <Card key={entry.id} className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{entry.memberName}</CardTitle>
                  <CardDescription className="text-white/60">
                    Total filler words: <span className="text-2xl font-bold text-[#c4a052]">{entry.totalCount}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {entry.fillerWords
                      .filter(f => f.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .map((filler) => (
                        <Badge key={filler.word} className="bg-[#c4a052] text-lg">
                          {filler.word}: {filler.count}
                        </Badge>
                      ))}
                    {entry.fillerWords.every(f => f.count === 0) && (
                      <span className="text-white/60">No filler words! 🎉</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!session?.entries || session.entries.length === 0) && (
            <div className="text-center text-white/60 text-2xl py-16">
              No speakers tracked yet
            </div>
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
          <h1 className="text-3xl font-bold text-[#772432]">Ah Counter</h1>
          <p className="text-muted-foreground">{meeting.theme}</p>
        </div>
        
        <div className="flex gap-2">
          {session && session.entries.length > 0 && (
            <Button
              onClick={() => setWrappedMode(true)}
              variant="outline"
              className="border-[#c4a052] text-[#c4a052] hover:bg-[#c4a052] hover:text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              View Summary
            </Button>
          )}
          <Button
            onClick={() => setPresentationMode(true)}
            className="bg-[#eab308] hover:bg-[#ca9a06] text-black"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Present
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Counter */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Quick Counter
              </CardTitle>
              <CardDescription>
                Select a speaker and tap to count filler words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedEntryId || ''} 
                onValueChange={(v) => setSelectedEntryId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {session?.entries.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.memberName} ({entry.totalCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEntry && (
                <div className="mt-4 space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <span className="text-4xl font-bold text-[#772432]">{selectedEntry.totalCount}</span>
                    <p className="text-sm text-muted-foreground">Total Filler Words</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {selectedEntry.fillerWords.map((filler) => (
                      <Button
                        key={filler.word}
                        variant="outline"
                        className="h-16 flex-col relative"
                        onClick={() => handleIncrementFiller(selectedEntry.id, filler.word)}
                      >
                        <span className="text-xs">{filler.word}</span>
                        <Badge className="absolute -top-2 -right-2 bg-[#c4a052]">
                          {filler.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleResetEntry(selectedEntry.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Filler Word */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Custom Filler Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newFillerWord}
                  onChange={(e) => setNewFillerWord(e.target.value)}
                  placeholder="Add new filler word"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFillerWord()}
                />
                <Button onClick={handleAddFillerWord}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {fillerWords.map((word) => (
                  <Badge key={word} variant="outline" className="text-xs">
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Speaker List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Speakers</CardTitle>
                <CardDescription>Track filler words for each speaker</CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Speaker
              </Button>
            </CardHeader>
            <CardContent>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {session?.entries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.memberName}</p>
                        <Badge className="bg-[#c4a052] text-lg mt-1">{entry.totalCount} filler words</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.fillerWords
                        .filter(f => f.count > 0)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                        .map((filler) => (
                          <Badge key={filler.word} variant="outline">
                            {filler.word}: {filler.count}
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedEntry?.id === entry.id ? 'secondary' : 'default'}
                        onClick={() => setSelectedEntryId(entry.id)}
                        className={`flex-1 ${selectedEntry?.id !== entry.id ? 'bg-[#772432] hover:bg-[#8f3a48]' : ''}`}
                      >
                        {selectedEntry?.id === entry.id ? 'Selected' : 'Count'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {(!session?.entries || session.entries.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    No speakers added yet. Tap &quot;Add Speaker&quot; to get started.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Top Filler Words</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session?.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.memberName}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#c4a052] text-lg">{entry.totalCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.fillerWords
                            .filter(f => f.count > 0)
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 3)
                            .map((filler) => (
                              <Badge key={filler.word} variant="outline">
                                {filler.word}: {filler.count}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={selectedEntry?.id === entry.id ? 'secondary' : 'default'}
                            onClick={() => setSelectedEntryId(entry.id)}
                            className={selectedEntry?.id !== entry.id ? 'bg-[#772432] hover:bg-[#8f3a48]' : ''}
                          >
                            {selectedEntry?.id === entry.id ? 'Selected' : 'Count'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!session?.entries || session.entries.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No speakers added yet. Click &quot;Add Speaker&quot; to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Speaker Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Speaker</DialogTitle>
            <DialogDescription>
              Select a member to track their filler words
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Member</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => !session?.entries.some(e => e.memberId === m.id))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={!selectedMember}
              className="bg-[#772432] hover:bg-[#8f3a48]"
            >
              Add Speaker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
