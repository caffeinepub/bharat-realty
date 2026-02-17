import { useGetListingsBySeller } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Plus } from 'lucide-react';
import { formatINR } from '../../utils/format';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function MyListingsPage() {
  const { data: listings = [], isLoading } = useGetListingsBySeller();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <Button onClick={() => navigate({ to: '/listing/new' })} className="gap-2">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading your listings...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first property listing to get started.</p>
              <Button onClick={() => navigate({ to: '/listing/new' })} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id.toString()}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
                    <Badge variant="secondary">{listing.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{formatINR(listing.quotedPrice)}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{listing.location}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/listing/$listingId', params: { listingId: listing.id.toString() } })}
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate({ to: '/listing/$listingId/edit', params: { listingId: listing.id.toString() } })}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
