'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Club, Member } from '@/lib/types';
import { getClubs, getMembers, createClub, deleteClub } from '@/lib/database';
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
import { Plus, Users, MapPin, Clock, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    location: '',
    meetingDay: '',
    meetingTime: '',
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = () => {
    const clubsList = getClubs();
    setClubs(clubsList);
    
    // Get member counts for each club
    const counts: Record<string, number> = {};
    clubsList.forEach(club => {
      counts[club.id] = getMembers(club.id).length;
    });
    setMemberCounts(counts);
  };

  const handleCreateClub = () => {
    if (!newClub.name.trim()) return;
    
    createClub({
      name: newClub.name,
      description: newClub.description,
      location: newClub.location,
      meetingDay: newClub.meetingDay,
      meetingTime: newClub.meetingTime,
    });
    
    setNewClub({
      name: '',
      description: '',
      location: '',
      meetingDay: '',
      meetingTime: '',
    });
    setIsDialogOpen(false);
    loadClubs();
  };

  const handleDeleteClub = (clubId: string, clubName: string) => {
    if (confirm(`Are you sure you want to delete "${clubName}"? This will also delete all members and meetings associated with this club.`)) {
      deleteClub(clubId);
      loadClubs();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#772432]">Clubs</h1>
          <p className="text-muted-foreground">
            Manage your Toastmasters clubs and their members
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#772432] hover:bg-[#8f3a48]">
              <Plus className="mr-2 h-4 w-4" />
              Create Club
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#772432]">Create New Club</DialogTitle>
              <DialogDescription>
                Add a new Toastmasters club to manage meetings and members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  placeholder="e.g., Downtown Toastmasters"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newClub.description}
                  onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                  placeholder="Brief description of your club"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newClub.location}
                  onChange={(e) => setNewClub({ ...newClub, location: e.target.value })}
                  placeholder="e.g., Online / City, Country"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="meetingDay">Meeting Day</Label>
                  <Input
                    id="meetingDay"
                    value={newClub.meetingDay}
                    onChange={(e) => setNewClub({ ...newClub, meetingDay: e.target.value })}
                    placeholder="e.g., Wednesday"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meetingTime">Meeting Time</Label>
                  <Input
                    id="meetingTime"
                    value={newClub.meetingTime}
                    onChange={(e) => setNewClub({ ...newClub, meetingTime: e.target.value })}
                    placeholder="e.g., 7:00 PM"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClub}
                disabled={!newClub.name.trim()}
                className="bg-[#772432] hover:bg-[#8f3a48]"
              >
                Create Club
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clubs Grid */}
      {clubs.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No clubs yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first club to get started managing meetings and members.
          </p>
          <Button 
            className="mt-4 bg-[#772432] hover:bg-[#8f3a48]"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Club
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Card 
              key={club.id} 
              className="group overflow-hidden transition-all hover:shadow-lg hover:border-[#772432]/30"
            >
              <CardHeader className="bg-gradient-to-r from-[#772432] to-[#8f3a48] text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{club.name}</CardTitle>
                    <CardDescription className="text-white/80 mt-1">
                      {memberCounts[club.id] || 0} member{memberCounts[club.id] !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteClub(club.id, club.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {club.description || 'No description provided'}
                </p>
                
                <div className="space-y-2 text-sm">
                  {club.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {club.location}
                    </div>
                  )}
                  {(club.meetingDay || club.meetingTime) && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {club.meetingDay}{club.meetingDay && club.meetingTime ? ' at ' : ''}{club.meetingTime}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/clubs/${club.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
