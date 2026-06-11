// src/app/page.tsx

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Mic2,
  Target,
  Award,
} from 'lucide-react';

const features = [
  {
    title: 'Club Management',
    description: 'Create and manage multiple Toastmasters clubs with member directories.',
    icon: Users,
    href: '/clubs',
    color: 'bg-[#772432]',
  },
  {
    title: 'Meeting Scheduler',
    description: 'Plan meetings with roles, Word of the Day, and participant assignments.',
    icon: Calendar,
    href: '/meetings',
    color: 'bg-[#004165]',
  },
  {
    title: 'Timer Tool',
    description: 'Track speech times with green, yellow, and red signals. Multiple presets available.',
    icon: Clock,
    href: '/tools/timer',
    color: 'bg-[#22c55e]',
  },
  {
    title: 'Ah Counter',
    description: 'Count filler words for each speaker and generate presentation-ready reports.',
    icon: MessageSquare,
    href: '/tools/ah-counter',
    color: 'bg-[#eab308]',
  },
  {
    title: 'Grammarian',
    description: 'Track grammar usage, notable phrases, and Word of the Day mentions.',
    icon: BookOpen,
    href: '/tools/grammarian',
    color: 'bg-[#c4a052]',
  },
];

const meetingRoles = [
  { name: 'Toastmaster', description: 'The meeting host who directs the program' },
  { name: 'General Evaluator', description: 'Evaluates the overall meeting quality' },
  { name: 'Timer', description: 'Tracks time for all speakers' },
  { name: 'Ah Counter', description: 'Counts filler words and crutch phrases' },
  { name: 'Grammarian', description: 'Monitors language use and introduces Word of the Day' },
  { name: 'Topicsmaster', description: 'Leads the Table Topics impromptu speaking session' },
  { name: 'Speaker', description: 'Delivers prepared speeches from the Pathways program' },
  { name: 'Evaluator', description: 'Provides constructive feedback to speakers' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#772432] to-[#5c1b26] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Empower Your{' '}
              <span className="text-[#c4a052]">Toastmasters</span> Journey
            </h1>
            <p className="mb-8 text-lg text-white/90 sm:text-xl">
              A comprehensive meeting management tool for Toastmasters clubs. 
              Track speeches, manage roles, time performances, and help members 
              become confident communicators.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#c4a052] text-[#1a1a1a] hover:bg-[#d4b76a]"
              >
                <Link href="/clubs">
                  <Users className="mr-2 h-5 w-5" />
                  Browse Clubs
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white hover:text-[#772432]"
              >
                <Link href="/meetings">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Meetings
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#772432]">
              Everything You Need for Your Meeting
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our tools help Toastmasters clubs run efficient, productive meetings 
              while tracking member progress and providing valuable feedback.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group transition-all hover:shadow-lg hover:border-[#772432]/30"
              >
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-[#772432]">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="ghost"
                    className="group-hover:text-[#772432]"
                  >
                    <Link href={feature.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meeting Roles Section */}
      <section className="bg-[#f5f3ef] py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#772432]">
              Understanding Meeting Roles
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Every Toastmasters meeting has various roles that help members 
              develop different skills. Here are the key roles you&apos;ll encounter.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {meetingRoles.map((role) => (
              <div
                key={role.name}
                className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold text-[#772432]">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#772432]/10">
                <Mic2 className="h-8 w-8 text-[#772432]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#772432]">
                Improve Speaking
              </h3>
              <p className="text-muted-foreground">
                Track your progress over time with detailed feedback from the 
                Grammarian and Ah Counter tools.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#c4a052]/10">
                <Target className="h-8 w-8 text-[#c4a052]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#772432]">
                Stay On Time
              </h3>
              <p className="text-muted-foreground">
                The Timer tool ensures speakers stay within their allotted time 
                with clear visual indicators.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#004165]/10">
                <Award className="h-8 w-8 text-[#004165]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#772432]">
                Build Leadership
              </h3>
              <p className="text-muted-foreground">
                Take on meeting roles to develop leadership skills and help 
                your club run smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#004165] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/90">
            Create your club, add members, and start managing your Toastmasters 
            meetings more effectively today.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#c4a052] text-[#1a1a1a] hover:bg-[#d4b76a]"
          >
            <Link href="/clubs">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
