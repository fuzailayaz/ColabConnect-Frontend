'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, MessageSquare, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'message' | 'team' | 'task' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const IntelligentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // Mock data - in a real app, these would come from API calls
    setNotifications([
      {
        id: '1',
        type: 'message',
        title: 'New message from Sarah Chen',
        description: 'Hey, I reviewed your proposal for the AI project...',
        timestamp: '10 minutes ago',
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'team',
        title: 'You were added to Web Dev Team',
        description: 'Alex Johnson added you to the Web Development team',
        timestamp: '2 hours ago',
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'task',
        title: 'Task deadline approaching',
        description: 'UI Design Review is due in 24 hours',
        timestamp: '5 hours ago',
        read: true,
        priority: 'high'
      },
      {
        id: '4',
        type: 'system',
        title: 'Weekly summary available',
        description: 'Your collaboration activity report is ready to view',
        timestamp: '1 day ago',
        read: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'message',
        title: 'Miguel commented on your project',
        description: 'Great work on implementing the authentication system!',
        timestamp: '2 days ago',
        read: true,
        priority: 'medium'
      }
    ]);
  }, []);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'team':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'task':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                {unreadCount} new
              </span>
            )}
          </CardTitle>
          <CardDescription>
            AI-prioritized updates from your collaborations
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          <Check className="h-4 w-4 mr-1" /> Mark all as read
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="message" className="flex-1">Messages</TabsTrigger>
            <TabsTrigger value="team" className="flex-1">Teams</TabsTrigger>
            <TabsTrigger value="task" className="flex-1">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No notifications to display
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`flex items-start p-3 rounded-lg transition-colors ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  } ${
                    notification.priority === 'high' ? 'border-l-4 border-red-500' : 
                    notification.priority === 'medium' ? 'border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="mt-0.5 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{notification.timestamp}</div>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center">
          <Button variant="ghost" className="text-sm">View all notifications</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentNotifications;
