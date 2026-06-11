// src/app/clubs/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Club, Member, Meeting, MemberPerformanceStats } from '@/lib/types';
import { formatDateShort, formatDateFull, formatStatus } from '@/lib/utils/date';
import { 
  getClub, 
  getMembers, 
  getMeetings,
  updateClub, 
  createMember, 
  deleteMember,
  deleteClub,
  updateMember,
  getClubPerformanceStats
} from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2,
  Mail,
  UserPlus,
  Settings,
  TrendingUp,
  Award,
  Target,
  Star,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [memberStats, setMemberStats] = useState<MemberPerformanceStats[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [editedClub, setEditedClub] = useState<Partial<Club>>({});
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member' as 'member' | 'officer' | 'guest',
  });

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = () => {
    const clubData = getClub(clubId);
    if (clubData) {
      setClub(clubData);
      setEditedClub(clubData);
      setMembers(getMembers(clubId));
      setMeetings(getMeetings(clubId));
      setMemberStats(getClubPerformanceStats(clubId));
    }
  };

  const handleUpdateClub = () => {
    if (!editedClub.name?.trim()) return;
    
    updateClub(clubId, editedClub);
    setIsEditDialogOpen(false);
    loadClubData();
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    
    createMember({
      clubId,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
    });
    
    setNewMember({ name: '', email: '', role: 'member' });
    setIsMemberDialogOpen(false);
    loadClubData();
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsEditMemberDialogOpen(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember || !editingMember.name.trim()) return;
    
    updateMember(editingMember.id, {
      name: editingMember.name,
      email: editingMember.email,
      role: editingMember.role,
    });
    
    setIsEditMemberDialogOpen(false);
    setEditingMember(null);
    loadClubData();
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove "${memberName}" from this club?`)) {
      deleteMember(memberId);
      loadClubData();
    }
  };

  const handleDeleteClub = () => {
    if (confirm(`Are you sure you want to delete "${club?.name}"? This action cannot be undone.`)) {
      deleteClub(clubId);
      router.push('/clubs');
    }
  };

  // Helper to capitalize role display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#772432]">Club not found</h1>
          <p className="mt-2 text-muted-foreground">
            The club you&apos;re looking for doesn&apos;t exist.
          </p>
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
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/clubs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clubs
        </Link>
      </Button>

      {/* Club Header */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-[#772432] to-[#8f3a48] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            <p className="mt-2 text-white/80">{club.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {club.location && (
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {club.location}
                </div>
              )}
              {(club.meetingDay || club.meetingTime) && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {club.meetingDay}{club.meetingDay && club.meetingTime ? ' at ' : ''}{club.meetingTime}
                </div>
              )}
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {members.length} member{members.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-[#772432]">Edit Club</DialogTitle>
                  <DialogDescription>
                    Update your club&apos;s information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Club Name *</Label>
                    <Input
                      id="edit-name"
                      value={editedClub.name || ''}
                      onChange={(e) => setEditedClub({ ...editedClub, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editedClub.description || ''}
                      onChange={(e) => setEditedClub({ ...editedClub, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editedClub.location || ''}
                      onChange={(e) => setEditedClub({ ...editedClub, location: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-meetingDay">Meeting Day</Label>
                      <Input
                        id="edit-meetingDay"
                        value={editedClub.meetingDay || ''}
                        onChange={(e) => setEditedClub({ ...editedClub, meetingDay: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-meetingTime">Meeting Time</Label>
                      <Input
                        id="edit-meetingTime"
                        value={editedClub.meetingTime || ''}
                        onChange={(e) => setEditedClub({ ...editedClub, meetingTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateClub}
                    className="bg-[#772432] hover:bg-[#8f3a48]"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteClub}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <Calendar className="mr-2 h-4 w-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  Manage club members and their roles
                </CardDescription>
              </div>
              <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#772432] hover:bg-[#8f3a48] w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-[#772432]">Add New Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to {club.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member-name">Name *</Label>
                      <Input
                        id="member-name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="member-email">Email</Label>
                      <Input
                        id="member-email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="member-role">Role</Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(value: 'member' | 'officer' | 'guest') => 
                          setNewMember({ ...newMember, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="officer">Officer</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddMember}
                      disabled={!newMember.name.trim()}
                      className="bg-[#772432] hover:bg-[#8f3a48]"
                    >
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Member Dialog */}
              <Dialog open={isEditMemberDialogOpen} onOpenChange={setIsEditMemberDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-[#772432]">Edit Member</DialogTitle>
                    <DialogDescription>
                      Update member information.
                    </DialogDescription>
                  </DialogHeader>
                  {editingMember && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                          id="edit-name"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          placeholder="Member name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editingMember.email}
                          onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                          placeholder="member@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                          value={editingMember.role}
                          onValueChange={(value: 'member' | 'officer' | 'guest') => 
                            setEditingMember({ ...editingMember, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="officer">Officer</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateMember}
                      disabled={!editingMember?.name.trim()}
                      className="bg-[#772432] hover:bg-[#8f3a48]"
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No members yet</p>
                  <Button 
                    className="mt-4 bg-[#772432] hover:bg-[#8f3a48]"
                    onClick={() => setIsMemberDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add First Member
                  </Button>
                </div>
              ) : (
                <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link 
                            href={`/clubs/${clubId}/members/${member.id}`}
                            className="font-medium text-[#772432] hover:underline"
                          >
                            {member.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={member.role === 'officer' ? 'default' : 'secondary'}
                              className={member.role === 'officer' ? 'bg-[#c4a052]' : ''}
                            >
                              {formatRole(member.role)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Joined {formatDateShort(member.joinedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center text-sm text-[#004165] hover:underline"
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          {member.email}
                        </a>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <Link href={`/clubs/${clubId}/members/${member.id}`}>
                            View Stats
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-4 w-4 text-[#004165]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/clubs/${clubId}/members/${member.id}`}
                            className="text-[#772432] hover:underline"
                          >
                            {member.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {member.email ? (
                            <a 
                              href={`mailto:${member.email}`}
                              className="flex items-center text-[#004165] hover:underline"
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              {member.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.role === 'officer' ? 'default' : 'secondary'}
                            className={member.role === 'officer' ? 'bg-[#c4a052]' : ''}
                          >
                            {formatRole(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateShort(member.joinedAt)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/clubs/${clubId}/members/${member.id}`}>
                              View Stats
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4 text-[#004165]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>
                  View and manage club meetings
                </CardDescription>
              </div>
              <Button asChild className="bg-[#772432] hover:bg-[#8f3a48] w-full sm:w-auto">
                <Link href={`/meetings/new?clubId=${clubId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No meetings scheduled</p>
                  <Button asChild className="mt-4 bg-[#772432] hover:bg-[#8f3a48]">
                    <Link href={`/meetings/new?clubId=${clubId}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule First Meeting
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Link 
                      key={meeting.id} 
                      href={`/meetings/${meeting.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{meeting.theme || 'Untitled Meeting'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDateFull(meeting.date)}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            meeting.status === 'completed' ? 'secondary' : 
                            meeting.status === 'in-progress' ? 'default' : 'outline'
                          }
                        >
                          {formatStatus(meeting.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Word of the Day:</span>{' '}
                        {meeting.wordOfTheDay.word}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Club Overview Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Meetings</p>
                      <p className="text-3xl font-bold text-[#772432]">{meetings.length}</p>
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
                      <p className="text-3xl font-bold text-[#772432]">
                        {memberStats.reduce((sum, s) => sum + s.totalSpeeches, 0)}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-[#772432]/20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Members</p>
                      <p className="text-3xl font-bold text-[#772432]">
                        {memberStats.filter(s => s.meetingsAttended > 0).length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-[#772432]/20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg On-Time Rate</p>
                      <p className="text-3xl font-bold text-[#772432]">
                        {memberStats.length > 0 
                          ? Math.round(memberStats.reduce((sum, s) => sum + s.timingAccuracy, 0) / memberStats.length)
                          : 0}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-[#772432]/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Speakers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#c4a052]" />
                    Top Speakers
                  </CardTitle>
                  <CardDescription>Members with most speeches</CardDescription>
                </CardHeader>
                <CardContent>
                  {memberStats.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No performance data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {memberStats
                        .sort((a, b) => b.totalSpeeches - a.totalSpeeches)
                        .slice(0, 5)
                        .map((stat, index) => (
                          <div key={stat.memberId} className="flex items-center gap-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              index === 0 ? 'bg-[#c4a052] text-black' : 
                              index === 1 ? 'bg-gray-300 text-black' : 
                              index === 2 ? 'bg-amber-600 text-white' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/clubs/${clubId}/members/${stat.memberId}`}
                                className="font-medium hover:underline"
                              >
                                {stat.memberName}
                              </Link>
                              <Progress value={stat.totalSpeeches > 0 ? (stat.totalSpeeches / Math.max(...memberStats.map(s => s.totalSpeeches))) * 100 : 0} className="h-2 mt-1" />
                            </div>
                            <span className="font-bold text-[#772432]">{stat.totalSpeeches}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Best Timing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Best Time Management
                  </CardTitle>
                  <CardDescription>Members with highest on-time rate</CardDescription>
                </CardHeader>
                <CardContent>
                  {memberStats.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No performance data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {memberStats
                        .filter(s => s.totalSpeeches > 0)
                        .sort((a, b) => b.timingAccuracy - a.timingAccuracy)
                        .slice(0, 5)
                        .map((stat, index) => (
                          <div key={stat.memberId} className="flex items-center gap-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              index === 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/clubs/${clubId}/members/${stat.memberId}`}
                                className="font-medium hover:underline"
                              >
                                {stat.memberName}
                              </Link>
                              <Progress value={stat.timingAccuracy} className="h-2 mt-1" />
                            </div>
                            <span className="font-bold text-green-600">{stat.timingAccuracy}%</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lowest Filler Words */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#eab308]" />
                    Cleanest Speakers
                  </CardTitle>
                  <CardDescription>Lowest average filler words per speech</CardDescription>
                </CardHeader>
                <CardContent>
                  {memberStats.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No performance data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {memberStats
                        .filter(s => s.totalSpeeches > 0)
                        .sort((a, b) => a.averageFillerWords - b.averageFillerWords)
                        .slice(0, 5)
                        .map((stat, index) => (
                          <div key={stat.memberId} className="flex items-center gap-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              index === 0 ? 'bg-[#eab308] text-black' : 'bg-muted text-muted-foreground'
                            }`}>
                              {stat.averageFillerWords === 0 ? '🌟' : index + 1}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/clubs/${clubId}/members/${stat.memberId}`}
                                className="font-medium hover:underline"
                              >
                                {stat.memberName}
                              </Link>
                            </div>
                            <span className="font-bold">
                              {stat.averageFillerWords === 0 ? (
                                <Badge className="bg-green-500">Perfect!</Badge>
                              ) : (
                                `${stat.averageFillerWords} avg`
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Rated (from evaluations) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#c4a052]" />
                    Highest Rated
                  </CardTitle>
                  <CardDescription>Best average evaluation scores</CardDescription>
                </CardHeader>
                <CardContent>
                  {memberStats.filter(s => s.evaluationsReceived > 0).length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No evaluations yet</p>
                  ) : (
                    <div className="space-y-4">
                      {memberStats
                        .filter(s => s.evaluationsReceived > 0)
                        .sort((a, b) => b.averageRating - a.averageRating)
                        .slice(0, 5)
                        .map((stat, index) => (
                          <div key={stat.memberId} className="flex items-center gap-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              index === 0 ? 'bg-[#c4a052] text-black' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/clubs/${clubId}/members/${stat.memberId}`}
                                className="font-medium hover:underline"
                              >
                                {stat.memberName}
                              </Link>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`h-3 w-3 ${star <= Math.round(stat.averageRating) ? 'text-[#c4a052] fill-[#c4a052]' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="font-bold text-[#c4a052]">{stat.averageRating}/5</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Members Stats Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Members Performance</CardTitle>
                <CardDescription>Click on a member to view detailed statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {memberStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No performance data yet. Start tracking meetings to see stats!
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead className="text-center">Speeches</TableHead>
                        <TableHead className="text-center">Table Topics</TableHead>
                        <TableHead className="text-center">Evaluations</TableHead>
                        <TableHead className="text-center">On-Time %</TableHead>
                        <TableHead className="text-center">Avg Fillers</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberStats
                        .sort((a, b) => b.totalSpeeches - a.totalSpeeches)
                        .map(stat => (
                          <TableRow key={stat.memberId}>
                            <TableCell>
                              <Link 
                                href={`/clubs/${clubId}/members/${stat.memberId}`}
                                className="font-medium hover:underline text-[#772432]"
                              >
                                {stat.memberName}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">{stat.totalSpeeches}</TableCell>
                            <TableCell className="text-center">{stat.totalTableTopics}</TableCell>
                            <TableCell className="text-center">{stat.totalEvaluations}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={
                                stat.timingAccuracy >= 80 ? 'default' : 
                                stat.timingAccuracy >= 50 ? 'secondary' : 'outline'
                              }>
                                {stat.timingAccuracy}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{stat.averageFillerWords}</TableCell>
                            <TableCell className="text-center">
                              {stat.evaluationsReceived > 0 ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 text-[#c4a052] fill-[#c4a052]" />
                                  <span>{stat.averageRating}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
