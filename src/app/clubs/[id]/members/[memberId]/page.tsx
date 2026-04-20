'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Member, Club, MemberPerformanceStats, SpeechRecording } from '@/lib/types';
import { getMember, getClub, getMemberPerformanceStats, getSpeechRecordingsByMember } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MessageSquare,
  BookOpen,
  Target,
  Award,
  Calendar,
  Star,
  ClipboardList,
  ThumbsUp,
  Lightbulb,
  Video,
  Mic,
  Sparkles,
  Play,
} from 'lucide-react';

export default function MemberPerformancePage() {
  const params = useParams();
  const memberId = params.memberId as string;

  const [member, setMember] = useState<Member | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState<MemberPerformanceStats | null>(null);
  const [recordings, setRecordings] = useState<SpeechRecording[]>([]);

  useEffect(() => {
    loadData();
  }, [memberId]);

  const loadData = () => {
    const memberData = getMember(memberId);
    if (memberData) {
      setMember(memberData);
      const clubData = getClub(memberData.clubId);
      setClub(clubData || null);
      const statsData = getMemberPerformanceStats(memberId);
      setStats(statsData);
      const recordingsData = getSpeechRecordingsByMember(memberId);
      setRecordings(recordingsData);
    }
  };

  const getTrendIcon = (trend: number[]) => {
    if (trend.length < 2) return <Minus className="h-4 w-4 text-gray-400" />;
    const recent = trend.slice(-3);
    const earlier = trend.slice(0, -3);
    if (earlier.length === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg < earlierAvg * 0.8) {
      return <TrendingDown className="h-4 w-4 text-green-500" />; // Less filler words = good
    } else if (recentAvg > earlierAvg * 1.2) {
      return <TrendingUp className="h-4 w-4 text-red-500" />; // More filler words = bad
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#772432]">Member not found</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/clubs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clubs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href={`/clubs/${member.clubId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {club?.name || 'Club'}
        </Link>
      </Button>

      {/* Member Info */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-[#772432] to-[#8f3a48] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{member.name}</h1>
            <p className="text-white/80">{club?.name}</p>
            <Badge className="mt-2 bg-[#c4a052] text-black">
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {stats ? (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meetings Attended</p>
                    <p className="text-3xl font-bold text-[#772432]">{stats.meetingsAttended}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#772432]/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Speeches</p>
                    <p className="text-3xl font-bold text-[#772432]">{stats.totalSpeeches}</p>
                  </div>
                  <Award className="h-8 w-8 text-[#772432]/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Table Topics</p>
                    <p className="text-3xl font-bold text-[#772432]">{stats.totalTableTopics}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-[#772432]/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Evaluations Given</p>
                    <p className="text-3xl font-bold text-[#772432]">{stats.totalEvaluations}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-[#772432]/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Filler Words */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#eab308]" />
                  Filler Words
                </CardTitle>
                <CardDescription>Track your improvement in reducing filler words</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average per speech</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.averageFillerWords}</span>
                      {getTrendIcon(stats.fillerWordTrend)}
                    </div>
                  </div>

                  {stats.fillerWordTrend.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Recent trend (last {stats.fillerWordTrend.length} speeches)
                        </p>
                        <div className="flex items-end gap-1 h-16">
                          {stats.fillerWordTrend.map((count, i) => {
                            const maxCount = Math.max(...stats.fillerWordTrend, 1);
                            const height = (count / maxCount) * 100;
                            return (
                              <div
                                key={i}
                                className="flex-1 bg-[#eab308] rounded-t transition-all"
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${count} filler words`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Timing Performance
                </CardTitle>
                <CardDescription>How well you stay within your allotted time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average speech time</span>
                    <span className="text-2xl font-bold">
                      {Math.floor(stats.averageSpeechTime / 60)}:{(stats.averageSpeechTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">On-time accuracy</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.timingAccuracy}%</span>
                      <Target className={`h-5 w-5 ${stats.timingAccuracy >= 80 ? 'text-green-500' : stats.timingAccuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
                    </div>
                  </div>

                  <Separator />

                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${stats.timingAccuracy >= 80 ? 'bg-green-500' : stats.timingAccuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${stats.timingAccuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {stats.timingAccuracy >= 80 ? 'Excellent time management!' : 
                     stats.timingAccuracy >= 50 ? 'Good, keep practicing!' : 
                     'Work on pacing your speeches'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Grammar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#c4a052]" />
                  Grammar & Language
                </CardTitle>
                <CardDescription>Your language use throughout meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Errors per speech</span>
                    <span className="text-2xl font-bold">{stats.grammarErrorsPerSpeech}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Word of Day usage</span>
                    <Badge className="bg-[#c4a052]">{stats.wordOfDayUsageCount} times</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Notable phrases</span>
                    <Badge variant="outline">{stats.goodPhrasesCount} times</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluations Received */}
            {stats.evaluationsReceived > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#004165]" />
                    Evaluation Feedback
                  </CardTitle>
                  <CardDescription>
                    Based on {stats.evaluationsReceived} evaluation{stats.evaluationsReceived !== 1 ? 's' : ''} received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Rating Overview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overall Rating</span>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-[#004165]">{stats.averageRating}</span>
                          <span className="text-muted-foreground">/5</span>
                          <Star className={`h-5 w-5 ${stats.averageRating >= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Rating Breakdown</p>
                        {Object.entries(stats.ratingBreakdown)
                          .filter(([_, value]) => value > 0)
                          .sort(([, a], [, b]) => b - a)
                          .map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span>{value}/5</span>
                              </div>
                              <Progress value={value * 20} className="h-2" />
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="space-y-4">
                      {stats.topStrengths.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            Top Strengths
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {stats.topStrengths.map((strength, i) => (
                              <Badge key={i} className="bg-green-100 text-green-800">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {stats.areasForImprovement.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Areas for Growth
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {stats.areasForImprovement.map((area, i) => (
                              <Badge key={i} className="bg-amber-100 text-amber-800">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#772432]" />
                  Tips for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {stats.averageFillerWords > 5 && (
                    <li className="flex items-start gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 mt-0.5">Tip</Badge>
                      <span>Practice pausing instead of using filler words. Silence is powerful!</span>
                    </li>
                  )}
                  {stats.timingAccuracy < 80 && (
                    <li className="flex items-start gap-2">
                      <Badge className="bg-blue-100 text-blue-800 mt-0.5">Tip</Badge>
                      <span>Practice with a timer to improve your time awareness.</span>
                    </li>
                  )}
                  {stats.wordOfDayUsageCount === 0 && stats.meetingsAttended > 0 && (
                    <li className="flex items-start gap-2">
                      <Badge className="bg-purple-100 text-purple-800 mt-0.5">Tip</Badge>
                      <span>Try to incorporate the Word of the Day in your speeches!</span>
                    </li>
                  )}
                  {stats.totalSpeeches < 5 && (
                    <li className="flex items-start gap-2">
                      <Badge className="bg-green-100 text-green-800 mt-0.5">Tip</Badge>
                      <span>Keep giving speeches! Experience is the best teacher.</span>
                    </li>
                  )}
                  {stats.totalEvaluations < stats.totalSpeeches && (
                    <li className="flex items-start gap-2">
                      <Badge className="bg-orange-100 text-orange-800 mt-0.5">Tip</Badge>
                      <span>Try evaluating other speakers to sharpen your analytical skills.</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Speech Recordings Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-[#772432]" />
                Speech Recordings
              </CardTitle>
              <CardDescription>
                {recordings.length > 0 
                  ? `${recordings.length} recorded speech${recordings.length !== 1 ? 'es' : ''}`
                  : 'No recordings yet'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No speech recordings yet</p>
                  <p className="text-sm">Record speeches during meetings to review and improve</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{recording.speechTitle || 'Untitled Speech'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {recording.recordingType === 'video' ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Mic className="h-3 w-3 mr-1" />
                              )}
                              {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                            </Badge>
                            <Badge variant="secondary">
                              {recording.speechType.replace('-', ' ')}
                            </Badge>
                            {recording.transcription && (
                              <Badge variant="default" className="bg-green-600">
                                Transcribed
                              </Badge>
                            )}
                            {recording.aiFeedback && (
                              <Badge variant="default" className="bg-[#c4a052]">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Feedback
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(recording.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Playback */}
                      {recording.blobUrl && (
                        <div className="bg-white rounded p-2 mb-3">
                          {recording.recordingType === 'video' ? (
                            <video src={recording.blobUrl} controls className="w-full rounded" />
                          ) : (
                            <audio src={recording.blobUrl} controls className="w-full" />
                          )}
                        </div>
                      )}

                      {/* AI Feedback Summary */}
                      {recording.aiFeedback && (
                        <div className="bg-white rounded p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">AI Feedback</span>
                            <Badge variant="outline">{recording.aiFeedback.overallScore}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{recording.aiFeedback.summary}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-green-700">
                              <span className="font-medium">Strengths:</span> {recording.aiFeedback.strengths.slice(0, 2).join(', ')}
                            </div>
                            <div className="text-amber-700">
                              <span className="font-medium">Improve:</span> {recording.aiFeedback.improvements.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Transcription Preview */}
                      {recording.transcription && !recording.aiFeedback && (
                        <div className="bg-white rounded p-3 text-sm text-gray-700">
                          <p className="font-medium text-xs text-gray-500 mb-1">Transcription:</p>
                          <p className="line-clamp-2">{recording.transcription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground text-lg">
              No performance data yet. Participate in meetings to track your progress!
            </p>
            <Button asChild className="mt-4 bg-[#772432] hover:bg-[#8f3a48]">
              <Link href="/meetings">View Meetings</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
