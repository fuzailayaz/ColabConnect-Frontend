'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Users, MessageSquare, Video, Calendar } from 'lucide-react';

const teams = [
  {
    id: 1,
    name: 'Team Alpha',
    members: 5,
    activeProject: 'AI Image Recognition',
    nextMeeting: '2024-03-05T10:00:00',
    status: 'active',
  },
  {
    id: 2,
    name: 'Web Dev Squad',
    members: 4,
    activeProject: 'E-commerce Platform',
    nextMeeting: '2024-03-06T15:00:00',
    status: 'active',
  },
];

export default function CollaborationHub() {
  const [activeTeam, setActiveTeam] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            layoutId={`team-${team.id}`}
            onClick={() => setActiveTeam(team.id)}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{team.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{team.members}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Active Project</p>
                    <p className="text-sm text-muted-foreground">
                      {team.activeProject}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Meet
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeTeam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Team Details</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add detailed team information here */}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
