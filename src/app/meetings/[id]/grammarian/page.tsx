'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Meeting, Member, GrammarianSession, GrammarianEntry } from '@/lib/types';
import { getMeeting, getMembers, getGrammarianSession, createGrammarianSession, updateGrammarianSession } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Plus,
  Maximize2,
  Minimize2,
  BookOpen,
  CheckCircle,
  XCircle,
  Star,
  Quote,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { WrappedPresentation, WrappedSlide } from '@/components/wrapped-presentation';

const ENTRY_TYPES = [
  { value: 'grammar-error', label: 'Grammar Error', icon: XCircle, color: 'text-red-500' },
  { value: 'good-usage', label: 'Good Usage', icon: CheckCircle, color: 'text-green-500' },
  { value: 'word-of-day-usage', label: 'Word of the Day Usage', icon: Star, color: 'text-[#c4a052]' },
  { value: 'notable-phrase', label: 'Notable Phrase', icon: Quote, color: 'text-blue-500' },
] as const;

export default function MeetingGrammarianPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<GrammarianSession | null>(null);
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [isWrappedMode, setWrappedMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [entryType, setEntryType] = useState<GrammarianEntry['type']>('grammar-error');
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const loadData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      setMembers(getMembers(meetingData.clubId));
      
      let gramSession = getGrammarianSession(meetingId);
      if (!gramSession) {
        gramSession = createGrammarianSession({
          meetingId,
          wordOfTheDay: meetingData.wordOfTheDay.word,
          entries: [],
        });
      }
      setSession(gramSession);
    }
  };

  const saveSession = useCallback((entries: GrammarianEntry[]) => {
    if (session) {
      const updated = updateGrammarianSession(session.id, { entries });
      if (updated) setSession(updated);
    }
  }, [session]);

  const handleAddEntry = () => {
    if (!selectedMember || !content.trim() || !session) return;
    
    const member = members.find(m => m.id === selectedMember);
    if (!member) return;

    const newEntry: GrammarianEntry = {
      id: uuidv4(),
      memberId: member.id,
      memberName: member.name,
      type: entryType,
      content: content.trim(),
      context: context.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    const updatedEntries = [...session.entries, newEntry];
    saveSession(updatedEntries);
    
    // Reset form
    setContent('');
    setContext('');
    setShowAddDialog(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!session) return;
    const updatedEntries = session.entries.filter(e => e.id !== entryId);
    saveSession(updatedEntries);
  };

  const getFilteredEntries = () => {
    if (!session) return [];
    if (activeTab === 'all') return session.entries;
    return session.entries.filter(e => e.type === activeTab);
  };

  const getEntryIcon = (type: GrammarianEntry['type']) => {
    const typeInfo = ENTRY_TYPES.find(t => t.value === type);
    if (!typeInfo) return null;
    const Icon = typeInfo.icon;
    return <Icon className={`h-4 w-4 ${typeInfo.color}`} />;
  };

  const getEntryCounts = () => {
    if (!session) return { errors: 0, good: 0, wotd: 0, phrases: 0 };
    return {
      errors: session.entries.filter(e => e.type === 'grammar-error').length,
      good: session.entries.filter(e => e.type === 'good-usage').length,
      wotd: session.entries.filter(e => e.type === 'word-of-day-usage').length,
      phrases: session.entries.filter(e => e.type === 'notable-phrase').length,
    };
  };

  const counts = getEntryCounts();

  const generateWrappedSlides = (): WrappedSlide[] => {
    if (!session || session.entries.length === 0) return [];

    const totalEntries = session.entries.length;
    const errorCount = counts.errors;
    const goodCount = counts.good;
    const wotdCount = counts.wotd;
    const phraseCount = counts.phrases;

    // Get unique speakers
    const speakerStats: Record<string, { name: string; errors: number; good: number; wotd: number; phrases: number }> = {};
    session.entries.forEach(entry => {
      if (!speakerStats[entry.memberId]) {
        speakerStats[entry.memberId] = {
          name: entry.memberName,
          errors: 0,
          good: 0,
          wotd: 0,
          phrases: 0,
        };
      }
      if (entry.type === 'grammar-error') speakerStats[entry.memberId].errors++;
      if (entry.type === 'good-usage') speakerStats[entry.memberId].good++;
      if (entry.type === 'word-of-day-usage') speakerStats[entry.memberId].wotd++;
      if (entry.type === 'notable-phrase') speakerStats[entry.memberId].phrases++;
    });

    const speakerList = Object.values(speakerStats);

    // Find grammar star (most good usages, least errors)
    const grammarStar = speakerList.reduce((best, current) => {
      const currentScore = current.good + current.wotd + current.phrases - current.errors;
      const bestScore = best.good + best.wotd + best.phrases - best.errors;
      return currentScore > bestScore ? current : best;
    });

    // Find notable phrases
    const notablePhrases = session.entries.filter(e => e.type === 'notable-phrase');

    // Find WOTD users
    const wotdUsers = session.entries.filter(e => e.type === 'word-of-day-usage');

    const slides: WrappedSlide[] = [
      {
        type: 'intro',
        title: 'Grammar Wrapped',
        subtitle: `Your meeting grammar report`,
        icon: 'book',
        color: 'gradient',
      },
      {
        type: 'stat',
        title: 'Total Observations',
        value: totalEntries,
        subtitle: `From ${speakerList.length} speaker${speakerList.length !== 1 ? 's' : ''}`,
        color: 'gold',
      },
    ];

    if (errorCount > 0 || goodCount > 0) {
      slides.push({
        type: 'list',
        title: 'Grammar Overview',
        items: [
          { label: '✅ Good Usage', value: goodCount, highlight: goodCount > errorCount },
          { label: '❌ Errors Found', value: errorCount, highlight: errorCount > goodCount },
        ],
        color: goodCount >= errorCount ? 'green' : 'burgundy',
      });
    }

    if (wotdCount > 0) {
      slides.push({
        type: 'stat',
        title: 'Word of the Day Usage',
        value: wotdCount,
        unit: `time${wotdCount !== 1 ? 's' : ''}`,
        subtitle: wotdCount >= 3 ? 'Great participation!' : 'Keep using the word!',
        icon: 'star',
        color: 'gold',
      });

      if (wotdUsers.length > 0) {
        slides.push({
          type: 'list',
          title: 'Word of the Day Champions',
          items: wotdUsers.map(u => ({
            label: u.memberName,
            value: `"${u.content}"`,
            highlight: true,
          })),
          color: 'gold',
        });
      }
    }

    if (notablePhrases.length > 0) {
      slides.push({
        type: 'list',
        title: 'Notable Phrases',
        items: notablePhrases.slice(0, 4).map(p => ({
          label: p.memberName,
          value: `"${p.content}"`,
          highlight: true,
        })),
        color: 'navy',
      });
    }

    if (grammarStar) {
      const score = grammarStar.good + grammarStar.wotd + grammarStar.phrases - grammarStar.errors;
      slides.push({
        type: 'highlight',
        title: 'Grammar Star',
        value: grammarStar.name,
        subtitle: `${grammarStar.good + grammarStar.wotd + grammarStar.phrases} positive, ${grammarStar.errors} error${grammarStar.errors !== 1 ? 's' : ''}`,
        icon: 'star',
        color: 'green',
      });
    }

    slides.push({
      type: 'summary',
      title: 'Meeting Summary',
      items: [
        { label: 'Good Usage', value: goodCount },
        { label: 'Errors', value: errorCount },
        { label: 'WOTD Uses', value: wotdCount },
        { label: 'Notable', value: phraseCount },
      ],
      subtitle: goodCount >= errorCount ? 'Great grammar today! 📚' : 'Keep improving! 💪',
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
          title="Grammarian Summary"
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
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
          onClick={() => setPresentationMode(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-[#c4a052]">
            Grammarian Report
          </h1>
          <p className="text-center text-xl mb-2">{meeting.theme}</p>
          
          {/* Word of the Day */}
          <div className="text-center mb-8 p-6 bg-[#c4a052]/20 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-[#c4a052] uppercase tracking-wide">Word of the Day</p>
            <h2 className="text-4xl font-bold text-[#c4a052] mt-2">{meeting.wordOfTheDay.word}</h2>
            <p className="text-white/60 mt-2 italic">{meeting.wordOfTheDay.partOfSpeech}</p>
            <p className="text-white/80 mt-2">{meeting.wordOfTheDay.definition}</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-red-500/20 rounded-lg">
              <div className="text-3xl font-bold text-red-400">{counts.errors}</div>
              <div className="text-sm text-white/60">Errors</div>
            </div>
            <div className="text-center p-4 bg-green-500/20 rounded-lg">
              <div className="text-3xl font-bold text-green-400">{counts.good}</div>
              <div className="text-sm text-white/60">Good Usage</div>
            </div>
            <div className="text-center p-4 bg-[#c4a052]/20 rounded-lg">
              <div className="text-3xl font-bold text-[#c4a052]">{counts.wotd}</div>
              <div className="text-sm text-white/60">WOTD Used</div>
            </div>
            <div className="text-center p-4 bg-blue-500/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">{counts.phrases}</div>
              <div className="text-sm text-white/60">Notable</div>
            </div>
          </div>

          {/* Entries by Member */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from(new Set(session?.entries.map(e => e.memberId))).map((memberId) => {
              const memberEntries = session?.entries.filter(e => e.memberId === memberId) || [];
              const memberName = memberEntries[0]?.memberName || 'Unknown';
              
              return (
                <Card key={memberId} className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">{memberName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {memberEntries.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-2">
                        {getEntryIcon(entry.type)}
                        <div>
                          <p className="text-white/90">{entry.content}</p>
                          {entry.context && (
                            <p className="text-sm text-white/50 italic mt-1">{entry.context}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {memberEntries.length === 0 && (
                      <p className="text-white/50">No entries</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!session?.entries || session.entries.length === 0) && (
            <div className="text-center text-white/60 text-2xl py-16">
              No entries recorded yet
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
          <h1 className="text-3xl font-bold text-[#772432]">Grammarian</h1>
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
            className="bg-[#c4a052] hover:bg-[#d4b76a] text-black"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Present
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Word of the Day & Quick Add */}
        <div className="lg:col-span-1 space-y-6">
          {/* Word of the Day */}
          <Card className="border-[#c4a052]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-[#c4a052]">
                <BookOpen className="mr-2 h-5 w-5" />
                Word of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-[#772432]">
                {meeting.wordOfTheDay.word}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                {meeting.wordOfTheDay.partOfSpeech}
              </p>
              <p className="mt-2 text-sm">
                {meeting.wordOfTheDay.definition}
              </p>
              {meeting.wordOfTheDay.exampleSentence && (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  &quot;{meeting.wordOfTheDay.exampleSentence}&quot;
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Grammar Errors</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-600">{counts.errors}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Good Usage</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-600">{counts.good}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#c4a052]" />
                  <span>WOTD Usage</span>
                </div>
                <Badge variant="outline" className="bg-[#c4a052]/10 text-[#c4a052]">{counts.wotd}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-blue-500" />
                  <span>Notable Phrases</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-600">{counts.phrases}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Add</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="w-full bg-[#772432] hover:bg-[#8f3a48]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Entries</CardTitle>
              <CardDescription>Track grammar, good usage, and notable phrases</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All ({session?.entries.length || 0})</TabsTrigger>
                  <TabsTrigger value="grammar-error" className="text-xs sm:text-sm">Errors ({counts.errors})</TabsTrigger>
                  <TabsTrigger value="good-usage" className="text-xs sm:text-sm">Good ({counts.good})</TabsTrigger>
                  <TabsTrigger value="word-of-day-usage" className="text-xs sm:text-sm">WOTD ({counts.wotd})</TabsTrigger>
                  <TabsTrigger value="notable-phrase" className="text-xs sm:text-sm">Notable ({counts.phrases})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {getFilteredEntries().map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getEntryIcon(entry.type)}
                            <span className="font-medium">{entry.memberName}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 -mr-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                        {entry.context && (
                          <p className="text-xs text-muted-foreground italic">{entry.context}</p>
                        )}
                      </div>
                    ))}
                    {getFilteredEntries().length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No entries yet. Tap &quot;Add Entry&quot; to get started.
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Type</TableHead>
                        <TableHead>Speaker</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Context</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredEntries().map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{getEntryIcon(entry.type)}</TableCell>
                          <TableCell className="font-medium">{entry.memberName}</TableCell>
                          <TableCell>{entry.content}</TableCell>
                          <TableCell className="text-muted-foreground text-sm italic">
                            {entry.context || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredEntries().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No entries yet. Click &quot;Add Entry&quot; to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grammarian Entry</DialogTitle>
            <DialogDescription>
              Record grammar observations for a speaker
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Speaker</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={entryType} onValueChange={(v) => setEntryType(v as GrammarianEntry['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                {entryType === 'grammar-error' ? 'Error' : 
                 entryType === 'word-of-day-usage' ? 'Usage' :
                 entryType === 'notable-phrase' ? 'Phrase' : 'Example'}
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  entryType === 'grammar-error' 
                    ? 'e.g., "He don\'t" instead of "He doesn\'t"'
                    : entryType === 'word-of-day-usage'
                    ? `Usage of "${meeting.wordOfTheDay.word}"`
                    : 'Enter the phrase or example'
                }
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Context (optional)</label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="When/where was this said?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEntry}
              disabled={!selectedMember || !content.trim()}
              className="bg-[#772432] hover:bg-[#8f3a48]"
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
