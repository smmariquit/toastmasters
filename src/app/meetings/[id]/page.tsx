'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Meeting, Member, Club } from '@/lib/types';
import { formatDateFull, formatStatus } from '@/lib/utils/date';
import { getMeeting, getClub, getMembers, getMember, updateMeeting } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar, 
  Clock,
  MessageSquare,
  BookOpen,
  Users,
  Play,
  CheckCircle,
  Timer,
  Mic2,
  ClipboardList,
  Video
} from 'lucide-react';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadMeetingData();
  }, [meetingId]);

  const loadMeetingData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      const clubData = getClub(meetingData.clubId);
      setClub(clubData || null);
      setMembers(getMembers(meetingData.clubId));
    }
  };

  const getMemberName = (memberId: string | undefined) => {
    if (!memberId) return 'Not assigned';
    const member = getMember(memberId);
    return member?.name || 'Unknown';
  };

  const handleStatusChange = (newStatus: 'scheduled' | 'in-progress' | 'completed') => {
    if (meeting) {
      updateMeeting(meetingId, { status: newStatus });
      loadMeetingData();
    }
  };

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#772432]">Meeting not found</h1>
          <p className="mt-2 text-muted-foreground">
            The meeting you&apos;re looking for doesn&apos;t exist.
          </p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/meetings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Link>
      </Button>

      {/* Meeting Header */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-[#772432] to-[#8f3a48] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{meeting.theme || 'Untitled Meeting'}</h1>
              <Badge 
                className={
                  meeting.status === 'completed' ? 'bg-green-500' :
                  meeting.status === 'in-progress' ? 'bg-[#c4a052]' :
                  'bg-white/20'
                }
              >
                {formatStatus(meeting.status)}
              </Badge>
            </div>
            <p className="text-white/80">{club?.name}</p>
            <div className="mt-4 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateFull(meeting.date)}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:items-end">
            <Select
              value={meeting.status}
              onValueChange={(value: 'scheduled' | 'in-progress' | 'completed') => 
                handleStatusChange(value)
              }
            >
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Word & Idiom of the Day */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-[#c4a052]">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Word of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-[#772432]">
                  {meeting.wordOfTheDay.word || 'Not set'}
                </h3>
                {meeting.wordOfTheDay.partOfSpeech && (
                  <p className="text-sm text-muted-foreground italic">
                    {meeting.wordOfTheDay.partOfSpeech}
                  </p>
                )}
                {meeting.wordOfTheDay.definition && (
                  <p className="mt-2 text-sm">
                    {meeting.wordOfTheDay.definition}
                  </p>
                )}
                {meeting.wordOfTheDay.exampleSentence && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    &quot;{meeting.wordOfTheDay.exampleSentence}&quot;
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-[#004165]">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Idiom of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-[#772432]">
                  {meeting.idiomOfTheDay.idiom || 'Not set'}
                </h3>
                {meeting.idiomOfTheDay.meaning && (
                  <p className="mt-2 text-sm">
                    {meeting.idiomOfTheDay.meaning}
                  </p>
                )}
                {meeting.idiomOfTheDay.exampleSentence && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    &quot;{meeting.idiomOfTheDay.exampleSentence}&quot;
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Meeting Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Tools</CardTitle>
              <CardDescription>
                Use these tools during the meeting to track time, filler words, grammar, and evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="h-24 flex-col">
                  <Link href={`/meetings/${meetingId}/timer`}>
                    <Clock className="mb-2 h-8 w-8 text-green-600" />
                    <span>Timer</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col">
                  <Link href={`/meetings/${meetingId}/ah-counter`}>
                    <MessageSquare className="mb-2 h-8 w-8 text-[#eab308]" />
                    <span>Ah Counter</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col">
                  <Link href={`/meetings/${meetingId}/grammarian`}>
                    <BookOpen className="mb-2 h-8 w-8 text-[#c4a052]" />
                    <span>Grammarian</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col">
                  <Link href={`/meetings/${meetingId}/evaluation`}>
                    <ClipboardList className="mb-2 h-8 w-8 text-[#004165]" />
                    <span>Evaluation</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col col-span-2 sm:col-span-1 lg:col-span-2">
                  <Link href={`/meetings/${meetingId}/recorder`}>
                    <Video className="mb-2 h-8 w-8 text-[#772432]" />
                    <span>Speech Recorder</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Roles */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Meeting Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toastmaster</span>
                  <span className="font-medium">{getMemberName(meeting.roles.toastmaster)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">General Evaluator</span>
                  <span className="font-medium">{getMemberName(meeting.roles.generalEvaluator)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timer</span>
                  <span className="font-medium">{getMemberName(meeting.roles.timer)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ah Counter</span>
                  <span className="font-medium">{getMemberName(meeting.roles.ahCounter)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grammarian</span>
                  <span className="font-medium">{getMemberName(meeting.roles.grammarian)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topicsmaster</span>
                  <span className="font-medium">{getMemberName(meeting.roles.topicsmaster)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {meeting.status === 'scheduled' && (
                <Button 
                  className="w-full bg-[#772432] hover:bg-[#8f3a48]"
                  onClick={() => handleStatusChange('in-progress')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Meeting
                </Button>
              )}
              {meeting.status === 'in-progress' && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange('completed')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  End Meeting
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/clubs/${meeting.clubId}`}>
                  View Club Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
