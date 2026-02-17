import { useGetListingsBySeller } from '../../hooks/useQueries';
import { useMarkMessageResponded } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/format';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import type { ContactMessage } from '../../backend';

export default function InboxMessagesPage() {
  const { data: listings = [], isLoading: listingsLoading } = useGetListingsBySeller();
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const markResponded = useMarkMessageResponded();
  const { actor, isFetching: actorFetching } = useActor();

  // Fetch messages for all listings at the top level
  const { data: allMessagesData = [], isLoading: messagesLoading } = useQuery<Array<ContactMessage & { listingTitle: string }>>({
    queryKey: ['allMessages', listings.map(l => l.id.toString())],
    queryFn: async () => {
      if (!actor || listings.length === 0) return [];
      
      const messagesPromises = listings.map(async (listing) => {
        try {
          const messages = await actor.getMessagesForListing(listing.id);
          return messages.map((msg) => ({ ...msg, listingTitle: listing.title }));
        } catch (error) {
          console.error(`Error fetching messages for listing ${listing.id}:`, error);
          return [];
        }
      });
      
      const messagesArrays = await Promise.all(messagesPromises);
      return messagesArrays.flat();
    },
    enabled: !!actor && !actorFetching && listings.length > 0,
  });

  const filteredMessages = useMemo(() => {
    if (selectedListingId === 'all') {
      return allMessagesData;
    }
    return allMessagesData.filter((msg) => msg.listingId.toString() === selectedListingId);
  }, [allMessagesData, selectedListingId]);

  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [filteredMessages]);

  const isLoading = listingsLoading || messagesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-muted-foreground">Messages from potential buyers</p>
          </div>
          {listings.length > 0 && (
            <Select value={selectedListingId} onValueChange={setSelectedListingId}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by listing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                {listings.map((listing) => (
                  <SelectItem key={listing.id.toString()} value={listing.id.toString()}>
                    {listing.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
              <p className="text-muted-foreground text-center">
                {selectedListingId === 'all'
                  ? 'Messages from buyers will appear here.'
                  : 'No messages for this listing yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <Card key={message.id.toString()}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{message.senderName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Re: {message.listingTitle}
                      </p>
                    </div>
                    <Badge variant={message.responded ? 'secondary' : 'default'}>
                      {message.responded ? 'Responded' : 'New'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">{formatDate(message.timestamp)}</span>
                    {!message.responded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markResponded.mutate(message.id)}
                        disabled={markResponded.isPending}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Responded
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
