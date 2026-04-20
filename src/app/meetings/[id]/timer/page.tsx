'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Meeting, Member, TimerSession, TimerEntry, TIMER_PRESETS, TimerPresetKey } from '@/lib/types';
import { getMeeting, getMembers, getTimerSession, createTimerSession, updateTimerSession } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Maximize2,
  Minimize2,
  Check,
  Users,
  Sparkles,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { WrappedPresentation, WrappedSlide } from '@/components/wrapped-presentation';

export default function MeetingTimerPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<TimerSession | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimerEntry | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [isWrappedMode, setWrappedMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<TimerPresetKey | 'custom'>('standard-speech');
  const [selectedRole, setSelectedRole] = useState<'speaker' | 'evaluator' | 'table-topics' | 'other'>('speaker');
  const [customGreen, setCustomGreen] = useState(5); // minutes
  const [customYellow, setCustomYellow] = useState(6); // minutes
  const [customRed, setCustomRed] = useState(7); // minutes
  const [customMax, setCustomMax] = useState(8); // minutes

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, [meetingId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const loadData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      setMembers(getMembers(meetingData.clubId));
      
      let timerSession = getTimerSession(meetingId);
      if (!timerSession) {
        timerSession = createTimerSession({
          meetingId,
          entries: [],
        });
      }
      setSession(timerSession);
    }
  };

  const saveSession = useCallback((entries: TimerEntry[]) => {
    if (session) {
      const updated = updateTimerSession(session.id, { entries });
      if (updated) setSession(updated);
    }
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!currentEntry) return 'bg-gray-400';
    if (time >= currentEntry.redTime) return 'timer-red';
    if (time >= currentEntry.yellowTime) return 'timer-yellow';
    if (time >= currentEntry.greenTime) return 'timer-green';
    return 'bg-gray-400';
  };

  const getTimerBorderColor = () => {
    if (!currentEntry) return 'border-gray-400';
    if (time >= currentEntry.redTime) return 'border-red-500';
    if (time >= currentEntry.yellowTime) return 'border-yellow-500';
    if (time >= currentEntry.greenTime) return 'border-green-500';
    return 'border-gray-400';
  };

  const handleAddSpeaker = () => {
    if (!selectedMember || !session) return;
    
    const member = members.find(m => m.id === selectedMember);
    if (!member) return;

    let greenTime: number, yellowTime: number, redTime: number, maxTime: number, speechType: string;

    if (selectedPreset === 'custom') {
      greenTime = customGreen * 60;
      yellowTime = customYellow * 60;
      redTime = customRed * 60;
      maxTime = customMax * 60;
      speechType = `Custom (${customGreen}-${customRed} min)`;
    } else {
      const preset = TIMER_PRESETS[selectedPreset];
      greenTime = preset.green;
      yellowTime = preset.yellow;
      redTime = preset.red;
      maxTime = preset.max;
      speechType = preset.label;
    }

    const newEntry: TimerEntry = {
      id: uuidv4(),
      memberId: member.id,
      memberName: member.name,
      role: selectedRole,
      speechType,
      greenTime,
      yellowTime,
      redTime,
      maxTime,
      status: 'pending',
    };

    const updatedEntries = [...session.entries, newEntry];
    saveSession(updatedEntries);
    setShowAddDialog(false);
    setSelectedMember('');
  };

  const handleStartTimer = (entry: TimerEntry) => {
    // If clicking on already active entry, just toggle play/pause
    if (currentEntry?.id === entry.id) {
      if (isRunning) {
        handlePauseTimer();
      } else {
        handleResumeTimer();
      }
      return;
    }
    
    // If there's another entry being timed, complete it first
    if (currentEntry && currentEntry.id !== entry.id && isRunning) {
      // Save the current entry's time before switching
      const updatedEntries = session?.entries.map(e =>
        e.id === currentEntry.id 
          ? { ...e, actualTime: time, status: 'completed' as const } 
          : e
      ) || [];
      if (session) {
        updateTimerSession(session.id, { entries: updatedEntries });
      }
    }
    
    setCurrentEntry(entry);
    setTime(entry.actualTime || 0);
    setIsRunning(true);

    // Update entry status
    if (session) {
      const updatedEntries = session.entries.map(e =>
        e.id === entry.id ? { ...e, status: 'timing' as const } : 
        (e.status === 'timing' ? { ...e, status: 'pending' as const } : e)
      );
      saveSession(updatedEntries);
    }
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResumeTimer = () => {
    setIsRunning(true);
  };

  const handleStopTimer = () => {
    if (!currentEntry || !session) return;
    
    setIsRunning(false);
    
    const updatedEntries = session.entries.map(e =>
      e.id === currentEntry.id 
        ? { ...e, actualTime: time, status: 'completed' as const } 
        : e
    );
    saveSession(updatedEntries);
    setCurrentEntry(null);
    setTime(0);
  };

  const handleResetTimer = () => {
    setTime(0);
  };

  const handleRemoveEntry = (entryId: string) => {
    if (!session) return;
    const updatedEntries = session.entries.filter(e => e.id !== entryId);
    saveSession(updatedEntries);
    if (currentEntry?.id === entryId) {
      setCurrentEntry(null);
      setTime(0);
      setIsRunning(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  const generateWrappedSlides = (): WrappedSlide[] => {
    if (!session || session.entries.length === 0) return [];

    const completedEntries = session.entries.filter(e => e.status === 'completed' && e.actualTime);
    const totalTime = completedEntries.reduce((sum, e) => sum + (e.actualTime || 0), 0);
    const avgTime = completedEntries.length > 0 ? Math.round(totalTime / completedEntries.length) : 0;
    
    // Find entries within time
    const onTime = completedEntries.filter(e => {
      const t = e.actualTime || 0;
      return t >= e.greenTime && t <= e.maxTime;
    });
    
    // Find overtime entries
    const overtime = completedEntries.filter(e => (e.actualTime || 0) > e.maxTime);
    
    // Find best timed speech (closest to yellow-red midpoint)
    const bestTimed = completedEntries.length > 0 
      ? completedEntries.reduce((best, current) => {
          const currentMid = (current.yellowTime + current.redTime) / 2;
          const currentDiff = Math.abs((current.actualTime || 0) - currentMid);
          const bestMid = (best.yellowTime + best.redTime) / 2;
          const bestDiff = Math.abs((best.actualTime || 0) - bestMid);
          return currentDiff < bestDiff ? current : best;
        })
      : null;

    const slides: WrappedSlide[] = [
      {
        type: 'intro',
        title: 'Timer Wrapped',
        subtitle: `Here's your meeting timing summary`,
        icon: 'clock',
        color: 'gradient',
      },
      {
        type: 'stat',
        title: 'Total Speaking Time',
        value: formatTime(totalTime),
        subtitle: `Across ${completedEntries.length} speaker${completedEntries.length !== 1 ? 's' : ''}`,
        color: 'burgundy',
      },
    ];

    if (completedEntries.length > 0) {
      slides.push({
        type: 'stat',
        title: 'Average Speech Duration',
        value: formatTime(avgTime),
        subtitle: 'Per speaker',
        color: 'navy',
      });
    }

    if (onTime.length > 0) {
      slides.push({
        type: 'stat',
        title: 'Speakers On Time',
        value: onTime.length,
        unit: `of ${completedEntries.length}`,
        subtitle: `${Math.round((onTime.length / completedEntries.length) * 100)}% success rate!`,
        icon: 'trophy',
        color: 'green',
      });
    }

    if (overtime.length > 0) {
      slides.push({
        type: 'list',
        title: 'Overtime Alerts',
        items: overtime.map(e => ({
          label: e.memberName,
          value: `+${formatTime((e.actualTime || 0) - e.maxTime)}`,
          highlight: true,
        })),
        color: 'red',
      });
    }

    if (bestTimed) {
      slides.push({
        type: 'highlight',
        title: 'Best Timed Speech',
        value: bestTimed.memberName,
        subtitle: `${formatTime(bestTimed.actualTime || 0)} - perfectly paced!`,
        icon: 'star',
        color: 'gold',
      });
    }

    if (completedEntries.length > 0) {
      slides.push({
        type: 'list',
        title: 'All Speakers',
        items: completedEntries.map(e => ({
          label: e.memberName,
          value: formatTime(e.actualTime || 0),
          highlight: !!(e.actualTime && e.actualTime >= e.greenTime && e.actualTime <= e.maxTime),
        })),
        color: 'navy',
      });
    }

    slides.push({
      type: 'summary',
      title: 'Meeting Summary',
      items: [
        { label: 'Speakers', value: completedEntries.length },
        { label: 'Total Time', value: formatTime(totalTime) },
        { label: 'On Time', value: `${onTime.length}/${completedEntries.length}` },
      ],
      subtitle: 'Great job everyone! 🎉',
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
          title="Timer Summary"
        />
      );
    }
    setWrappedMode(false);
  }

  if (isPresentationMode) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center ${getTimerColor()} transition-colors duration-300`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={() => setPresentationMode(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
        
        <div className="text-center text-white">
          {currentEntry && (
            <p className="mb-4 text-2xl font-medium">{currentEntry.memberName}</p>
          )}
          <div className="text-[12rem] font-bold timer-display leading-none">
            {formatTime(time)}
          </div>
          {currentEntry && (
            <p className="mt-4 text-xl">{currentEntry.speechType}</p>
          )}
          
          <div className="mt-8 flex justify-center gap-4">
            {!isRunning ? (
              <Button
                size="lg"
                onClick={handleResumeTimer}
                className="bg-white/20 hover:bg-white/30"
              >
                <Play className="mr-2 h-5 w-5" />
                {time > 0 ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handlePauseTimer}
                className="bg-white/20 hover:bg-white/30"
              >
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleStopTimer}
              variant="secondary"
            >
              <Check className="mr-2 h-5 w-5" />
              Complete
            </Button>
          </div>
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
          <h1 className="text-3xl font-bold text-[#772432]">Timer</h1>
          <p className="text-muted-foreground">{meeting.theme}</p>
        </div>
        
        <div className="flex gap-2">
          {session && session.entries.some(e => e.status === 'completed') && (
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
            className="bg-[#772432] hover:bg-[#8f3a48]"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Present
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer Display */}
        <div className="lg:col-span-1">
          <Card className={`border-4 ${getTimerBorderColor()} transition-colors duration-300`}>
            <CardHeader>
              <CardTitle>Current Timer</CardTitle>
              {currentEntry && (
                <CardDescription>{currentEntry.memberName} - {currentEntry.speechType}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className={`mb-4 rounded-lg p-8 text-center ${getTimerColor()} transition-colors duration-300`}>
                <div className="text-6xl font-bold text-white timer-display">
                  {formatTime(time)}
                </div>
              </div>

              {currentEntry && (
                <div className="mb-4 flex justify-center gap-2">
                  <Badge className="bg-green-500">
                    {formatTime(currentEntry.greenTime)}
                  </Badge>
                  <Badge className="bg-yellow-500 text-black">
                    {formatTime(currentEntry.yellowTime)}
                  </Badge>
                  <Badge className="bg-red-500">
                    {formatTime(currentEntry.redTime)}
                  </Badge>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2">
                {!isRunning ? (
                  <Button onClick={() => currentEntry ? handleResumeTimer() : null} disabled={!currentEntry}>
                    <Play className="mr-2 h-4 w-4" />
                    {time > 0 ? 'Resume' : 'Start'}
                  </Button>
                ) : (
                  <Button onClick={handlePauseTimer} variant="secondary">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={handleResetTimer} variant="outline" disabled={!currentEntry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={handleStopTimer} variant="destructive" disabled={!currentEntry}>
                  <Check className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timer Presets Legend */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Timer Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
                <div key={key} className="flex justify-between">
                  <span>{preset.label}</span>
                  <span className="text-muted-foreground">
                    {formatTime(preset.green)} - {formatTime(preset.red)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Speaker List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Speakers</CardTitle>
                <CardDescription>Add speakers and track their time</CardDescription>
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
                        <p className="text-sm text-muted-foreground">{entry.speechType}</p>
                      </div>
                      <Badge
                        className={
                          entry.status === 'completed' ? 'bg-green-500' :
                          (entry.status === 'timing' || currentEntry?.id === entry.id) ? 'bg-[#c4a052] animate-pulse' :
                          'bg-gray-400'
                        }
                      >
                        {entry.status === 'completed' ? 'Completed' :
                         (entry.status === 'timing' || currentEntry?.id === entry.id) ? (isRunning ? 'Timing...' : 'Paused') :
                         'Pending'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target: {formatTime(entry.greenTime)} - {formatTime(entry.redTime)}</span>
                      <span className="font-medium">
                        Actual: {currentEntry?.id === entry.id 
                          ? formatTime(time)
                          : entry.actualTime !== undefined 
                            ? formatTime(entry.actualTime) 
                            : '-'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {entry.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant={currentEntry?.id === entry.id ? 'secondary' : 'default'}
                          onClick={() => handleStartTimer(entry)}
                          className={`flex-1 ${currentEntry?.id !== entry.id ? 'bg-[#772432] hover:bg-[#8f3a48]' : ''}`}
                        >
                          {currentEntry?.id === entry.id 
                            ? (isRunning ? 'Pause' : 'Resume') 
                            : 'Start Timer'}
                        </Button>
                      )}
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
              <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Time</TableHead>
                    <TableHead>Actual Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session?.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.memberName}</TableCell>
                      <TableCell>{entry.speechType}</TableCell>
                      <TableCell>
                        {formatTime(entry.greenTime)} - {formatTime(entry.redTime)}
                      </TableCell>
                      <TableCell>
                        {currentEntry?.id === entry.id 
                          ? formatTime(time)
                          : entry.actualTime !== undefined 
                            ? formatTime(entry.actualTime) 
                            : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            entry.status === 'completed' ? 'bg-green-500' :
                            (entry.status === 'timing' || currentEntry?.id === entry.id) ? 'bg-[#c4a052] animate-pulse' :
                            'bg-gray-400'
                          }
                        >
                          {entry.status === 'completed' ? 'Completed' :
                           (entry.status === 'timing' || currentEntry?.id === entry.id) ? (isRunning ? 'Timing...' : 'Paused') :
                           'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {entry.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant={currentEntry?.id === entry.id ? 'secondary' : 'default'}
                              onClick={() => handleStartTimer(entry)}
                              className={currentEntry?.id !== entry.id ? 'bg-[#772432] hover:bg-[#8f3a48]' : ''}
                            >
                              {currentEntry?.id === entry.id 
                                ? (isRunning ? 'Pause' : 'Resume') 
                                : 'Time'}
                            </Button>
                          )}
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
              Select a member and configure their timer settings
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
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as typeof selectedRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speaker">Speaker</SelectItem>
                  <SelectItem value="evaluator">Evaluator</SelectItem>
                  <SelectItem value="table-topics">Table Topics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Timer Preset</label>
              <Select value={selectedPreset} onValueChange={(v) => setSelectedPreset(v as TimerPresetKey | 'custom')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Time Inputs */}
            {selectedPreset === 'custom' && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Set custom time thresholds (in minutes)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Green
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customGreen}
                      onChange={(e) => setCustomGreen(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Yellow
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customYellow}
                      onChange={(e) => setCustomYellow(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Red
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customRed}
                      onChange={(e) => setCustomRed(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-800" />
                      Max
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customMax}
                      onChange={(e) => setCustomMax(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSpeaker}
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
