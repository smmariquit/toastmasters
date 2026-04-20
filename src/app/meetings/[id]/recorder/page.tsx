'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Meeting, Member, SpeechRecording, AIFeedback } from '@/lib/types';
import {
  getMeeting,
  getMembers,
  getSpeechRecordingsByMeeting,
  createSpeechRecording,
  updateSpeechRecording,
  deleteSpeechRecording,
} from '@/lib/database';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Video,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Sparkles,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  MicOff,
  VideoOff,
  Edit,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type RecordingMode = 'video' | 'audio';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaRecorder: MediaRecorder | null;
  stream: MediaStream | null;
  chunks: Blob[];
}

export default function SpeechRecorderPage() {
  const params = useParams();
  const meetingId = params.id as string;

  // Core state
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [recordings, setRecordings] = useState<SpeechRecording[]>([]);

  // Recording state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('video');
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    mediaRecorder: null,
    stream: null,
    chunks: [],
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Form state
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [speechTitle, setSpeechTitle] = useState('');
  const [speechType, setSpeechType] = useState<SpeechRecording['speechType']>('prepared-speech');

  // Processing state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Dialog state
  const [selectedRecording, setSelectedRecording] = useState<SpeechRecording | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingTranscription, setEditingTranscription] = useState<{id: string, text: string} | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [meetingId]);

  const loadData = () => {
    const meetingData = getMeeting(meetingId);
    if (meetingData) {
      setMeeting(meetingData);
      setMembers(getMembers(meetingData.clubId));
      setRecordings(getSpeechRecordingsByMeeting(meetingId));
    }
  };

  // Timer for recording duration
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingState((prev) => ({ ...prev, duration: prev.duration + 1 }));
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
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Request camera/microphone permissions
  const requestPermissions = async (mode: RecordingMode) => {
    setPermissionError(null);
    try {
      const constraints: MediaStreamConstraints =
        mode === 'video'
          ? { video: true, audio: true }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasPermission(true);

      // Show preview
      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      setRecordingState((prev) => ({ ...prev, stream }));
      return stream;
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setPermissionError('Permission denied. Please allow access to your camera/microphone.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No camera/microphone found. Please connect a device.');
        } else {
          setPermissionError(`Error accessing media devices: ${error.message}`);
        }
      }
      return null;
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!selectedMember) {
      alert('Please select a speaker first');
      return;
    }

    let stream = recordingState.stream;
    if (!stream) {
      stream = await requestPermissions(recordingMode);
      if (!stream) return;
    }

    const mimeType = recordingMode === 'video' ? 'video/webm;codecs=vp9' : 'audio/webm;codecs=opus';
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      handleRecordingComplete(chunks);
    };

    mediaRecorder.start(1000); // Collect data every second

    setRecordingState((prev) => ({
      ...prev,
      isRecording: true,
      isPaused: false,
      duration: 0,
      mediaRecorder,
      chunks: [],
    }));
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!recordingState.mediaRecorder) return;

    if (recordingState.isPaused) {
      recordingState.mediaRecorder.resume();
    } else {
      recordingState.mediaRecorder.pause();
    }

    setRecordingState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Stop recording
  const stopRecording = () => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.stop();
    }
  };

  // Handle completed recording
  const handleRecordingComplete = async (chunks: Blob[]) => {
    const mimeType = recordingMode === 'video' ? 'video/webm' : 'audio/webm';
    const blob = new Blob(chunks, { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    // Find member name
    const member = members.find((m) => m.id === selectedMember);
    const memberName = member?.name || 'Unknown';

    // Create recording entry
    const recording = createSpeechRecording({
      meetingId,
      memberId: selectedMember,
      memberName,
      speechTitle: speechTitle || undefined,
      speechType,
      recordingType: recordingMode,
      duration: recordingState.duration,
      blobUrl,
    });

    // Reset state
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      mediaRecorder: null,
      stream: null,
      chunks: [],
    });

    // Stop video preview
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop all tracks
    if (recordingState.stream) {
      recordingState.stream.getTracks().forEach((track) => track.stop());
    }

    setHasPermission(null);
    setSpeechTitle('');
    loadData();

    // Auto-transcribe
    await transcribeRecording(recording.id, blob);
  };

  // Transcribe recording
  const transcribeRecording = async (recordingId: string, blob?: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      // Get the blob if not provided
      let audioBlob = blob;
      if (!audioBlob) {
        const recording = recordings.find((r) => r.id === recordingId);
        if (!recording?.blobUrl) {
          throw new Error('Recording not found');
        }
        const response = await fetch(recording.blobUrl);
        audioBlob = await response.blob();
      }

      // Convert to proper format for Whisper API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const result = await response.json();

      // Update recording with transcription
      updateSpeechRecording(recordingId, {
        transcription: result.transcription,
      });

      loadData();
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionError(error instanceof Error ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Generate AI feedback
  const generateFeedback = async (recording: SpeechRecording) => {
    if (!recording.transcription) {
      alert('Please transcribe the recording first');
      return;
    }

    setIsGeneratingFeedback(true);
    setFeedbackError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: recording.transcription,
          speechType: recording.speechType,
          speechTitle: recording.speechTitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate feedback');
      }

      const feedback: AIFeedback = await response.json();

      // Update recording with feedback
      updateSpeechRecording(recording.id, { aiFeedback: feedback });

      loadData();
      
      // Open feedback dialog
      const updatedRecording = { ...recording, aiFeedback: feedback };
      setSelectedRecording(updatedRecording);
      setShowFeedbackDialog(true);
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedbackError(error instanceof Error ? error.message : 'Failed to generate feedback');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Save edited transcription
  const handleSaveTranscription = () => {
    if (!editingTranscription) return;
    updateSpeechRecording(editingTranscription.id, { transcription: editingTranscription.text });
    setEditingTranscription(null);
    loadData();
  };

  // Delete recording
  const handleDeleteRecording = (id: string) => {
    // Revoke blob URL to free memory
    const recording = recordings.find((r) => r.id === id);
    if (recording?.blobUrl) {
      URL.revokeObjectURL(recording.blobUrl);
    }

    deleteSpeechRecording(id);
    setDeleteConfirmId(null);
    loadData();
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get recording type badge
  const getTypeBadge = (type: SpeechRecording['speechType']) => {
    const typeConfig = {
      'prepared-speech': { label: 'Prepared Speech', variant: 'default' as const },
      'table-topics': { label: 'Table Topics', variant: 'secondary' as const },
      evaluation: { label: 'Evaluation', variant: 'outline' as const },
      other: { label: 'Other', variant: 'outline' as const },
    };
    const config = typeConfig[type];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/meetings/${meetingId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#772432]">Speech Recorder</h1>
            <p className="text-gray-600">{meeting.theme}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recording Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {recordingMode === 'video' ? (
                  <Video className="h-5 w-5 text-[#772432]" />
                ) : (
                  <Mic className="h-5 w-5 text-[#772432]" />
                )}
                New Recording
              </CardTitle>
              <CardDescription>Record speeches for transcription and AI feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recording mode toggle */}
              <Tabs
                value={recordingMode}
                onValueChange={(v) => setRecordingMode(v as RecordingMode)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="video" disabled={recordingState.isRecording}>
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" disabled={recordingState.isRecording}>
                    <Mic className="h-4 w-4 mr-2" />
                    Audio Only
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Video preview */}
              {recordingMode === 'video' && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  {!recordingState.stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-70">Camera preview</p>
                      </div>
                    </div>
                  )}
                  {recordingState.isRecording && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="destructive" className="animate-pulse">
                        {recordingState.isPaused ? 'Paused' : 'Recording'}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Audio-only indicator */}
              {recordingMode === 'audio' && (
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  {recordingState.isRecording ? (
                    <div className="text-center">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-lg font-medium">
                          {recordingState.isPaused ? 'Paused' : 'Recording Audio'}
                        </span>
                      </div>
                      <p className="text-2xl font-mono">{formatTime(recordingState.duration)}</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Mic className="h-12 w-12 mx-auto mb-2" />
                      <p>Ready to record audio</p>
                    </div>
                  )}
                </div>
              )}

              {/* Permission error */}
              {permissionError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{permissionError}</p>
                </div>
              )}

              {/* Recording timer (for video mode) */}
              {recordingMode === 'video' && recordingState.isRecording && (
                <div className="text-center">
                  <p className="text-3xl font-mono">{formatTime(recordingState.duration)}</p>
                </div>
              )}

              {/* Speaker selection */}
              <div className="space-y-2">
                <Label>Speaker</Label>
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                  disabled={recordingState.isRecording}
                >
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

              {/* Speech details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Speech Type</Label>
                  <Select
                    value={speechType}
                    onValueChange={(v) => setSpeechType(v as SpeechRecording['speechType'])}
                    disabled={recordingState.isRecording}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepared-speech">Prepared Speech</SelectItem>
                      <SelectItem value="table-topics">Table Topics</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Speech Title (Optional)</Label>
                  <Input
                    value={speechTitle}
                    onChange={(e) => setSpeechTitle(e.target.value)}
                    placeholder="Enter title..."
                    disabled={recordingState.isRecording}
                  />
                </div>
              </div>

              {/* Recording controls */}
              <div className="flex justify-center gap-4">
                {!recordingState.isRecording ? (
                  <Button
                    size="lg"
                    className="bg-[#772432] hover:bg-[#5c1c27]"
                    onClick={startRecording}
                  >
                    {recordingMode === 'video' ? (
                      <Video className="h-5 w-5 mr-2" />
                    ) : (
                      <Mic className="h-5 w-5 mr-2" />
                    )}
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="lg" onClick={togglePause}>
                      {recordingState.isPaused ? (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recordings List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#772432]" />
                Recordings
              </CardTitle>
              <CardDescription>
                {recordings.length} recording{recordings.length !== 1 ? 's' : ''} from this meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recordings yet</p>
                  <p className="text-sm">Start recording a speech to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="p-4 bg-gray-50 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{recording.memberName}</p>
                          <p className="text-sm text-gray-600">
                            {recording.speechTitle || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getTypeBadge(recording.speechType)}
                            <Badge variant="outline">
                              {recording.recordingType === 'video' ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Mic className="h-3 w-3 mr-1" />
                              )}
                              {formatTime(recording.duration)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteConfirmId(recording.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Playback */}
                      {recording.blobUrl && (
                        <div className="bg-white rounded p-2">
                          {recording.recordingType === 'video' ? (
                            <video
                              src={recording.blobUrl}
                              controls
                              className="w-full rounded"
                            />
                          ) : (
                            <audio
                              src={recording.blobUrl}
                              controls
                              className="w-full"
                            />
                          )}
                        </div>
                      )}

                      {/* Transcription status */}
                      <div className="flex items-center gap-2">
                        {recording.transcription ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Transcribed
                          </Badge>
                        ) : isTranscribing ? (
                          <Badge variant="secondary">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Transcribing...
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => transcribeRecording(recording.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Transcribe
                          </Button>
                        )}

                        {recording.aiFeedback ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecording(recording);
                              setShowFeedbackDialog(true);
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-1 text-[#c4a052]" />
                            View Feedback
                          </Button>
                        ) : recording.transcription ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateFeedback(recording)}
                            disabled={isGeneratingFeedback}
                          >
                            {isGeneratingFeedback ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-1 text-[#c4a052]" />
                            )}
                            Get AI Feedback
                          </Button>
                        ) : null}
                      </div>

                      {/* Show transcription preview */}
                      {recording.transcription && (
                        <div className="bg-white rounded p-3 text-sm text-gray-700">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-xs text-gray-500">Transcription:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTranscription({
                                id: recording.id,
                                text: recording.transcription || ''
                              })}
                              className="h-6 px-2 text-xs text-[#004165] hover:text-[#004165]/80"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          <p className="line-clamp-3">{recording.transcription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Error displays */}
              {transcriptionError && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{transcriptionError}</p>
                </div>
              )}

              {feedbackError && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{feedbackError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#c4a052]" />
              AI Speech Feedback
            </DialogTitle>
            <DialogDescription>
              {selectedRecording?.memberName} - {selectedRecording?.speechTitle || 'Untitled'}
            </DialogDescription>
          </DialogHeader>

          {selectedRecording?.aiFeedback && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-[#772432]">
                  {selectedRecording.aiFeedback.overallScore}/10
                </div>
                <p className="text-gray-600 mt-2">{selectedRecording.aiFeedback.summary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {selectedRecording.aiFeedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {selectedRecording.aiFeedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div>
                <h4 className="font-semibold mb-3">Detailed Analysis</h4>
                <div className="space-y-3">
                  {Object.entries(selectedRecording.aiFeedback.detailedAnalysis).map(
                    ([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{key}</span>
                          <Badge variant="outline">{value.score}/10</Badge>
                        </div>
                        <Progress value={value.score * 10} className="h-2 mb-2" />
                        <p className="text-sm text-gray-600">{value.feedback}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Suggested Exercises */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Suggested Exercises</h4>
                <ul className="space-y-1">
                  {selectedRecording.aiFeedback.suggestedExercises.map((e, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowFeedbackDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recording, including any transcription and feedback.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirmId && handleDeleteRecording(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transcription Dialog */}
      <Dialog open={!!editingTranscription} onOpenChange={() => setEditingTranscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#772432]">Edit Transcription</DialogTitle>
            <DialogDescription>
              Make corrections to the AI-generated transcription
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingTranscription?.text || ''}
            onChange={(e) => setEditingTranscription(prev => 
              prev ? { ...prev, text: e.target.value } : null
            )}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Transcription text..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTranscription(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTranscription}
              className="bg-[#772432] hover:bg-[#8f3a48]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
