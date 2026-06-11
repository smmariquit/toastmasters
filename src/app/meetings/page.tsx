// src/app/meetings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Meeting, Club } from '@/lib/types';
import { formatDateFull, formatStatus } from '@/lib/utils/date';
import { getMeetings, getClubs, getClub, deleteMeeting } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  ArrowRight, 
  Trash2,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedClubId]);

  const loadData = () => {
    setClubs(getClubs());
    const allMeetings = selectedClubId === 'all' 
      ? getMeetings() 
      : getMeetings(selectedClubId);
    
    // Sort by date, most recent first
    allMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeetings(allMeetings);
  };

  const handleDeleteMeeting = (meetingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this meeting?')) {
      deleteMeeting(meetingId);
      loadData();
    }
  };

  const getClubName = (clubId: string) => {
    const club = getClub(clubId);
    return club?.name || 'Unknown Club';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-[#c4a052] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#772432]">Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage Toastmasters meetings
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedClubId} onValueChange={setSelectedClubId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button asChild className="bg-[#772432] hover:bg-[#8f3a48]">
            <Link href="/meetings/new">
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Link>
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No meetings yet</h2>
          <p className="mt-2 text-muted-foreground">
            {clubs.length === 0 
              ? 'Create a club first, then schedule your first meeting.'
              : 'Schedule your first meeting to get started.'}
          </p>
          <Button 
            asChild
            className="mt-4 bg-[#772432] hover:bg-[#8f3a48]"
          >
            <Link href={clubs.length === 0 ? '/clubs' : '/meetings/new'}>
              <Plus className="mr-2 h-4 w-4" />
              {clubs.length === 0 ? 'Create a Club First' : 'Schedule First Meeting'}
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Link 
              key={meeting.id} 
              href={`/meetings/${meeting.id}`}
              className="block"
            >
              <Card className="transition-all hover:shadow-lg hover:border-[#772432]/30">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#772432]">
                          {meeting.theme || 'Untitled Meeting'}
                        </h3>
                        <Badge className={getStatusColor(meeting.status)}>
                          {formatStatus(meeting.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-2">
                        <span className="font-medium">{getClubName(meeting.clubId)}</span>
                        {' • '}
                        {formatDateFull(meeting.date)}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <BookOpen className="mr-1 h-4 w-4 text-[#c4a052]" />
                          <span className="font-medium">Word:</span>
                          <span className="ml-1">{meeting.wordOfTheDay.word}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MessageSquare className="mr-1 h-4 w-4 text-[#004165]" />
                          <span className="font-medium">Idiom:</span>
                          <span className="ml-1">{meeting.idiomOfTheDay.idiom}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteMeeting(meeting.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
