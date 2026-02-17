import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing, useUpdateListing } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ListingForm from '../../components/listings/ListingForm';
import ImageUploader from '../../components/listings/ImageUploader';
import type { PropertyCategory, Currency, ListingStatus } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function EditListingPage() {
  const { listingId } = useParams({ from: '/listing/$listingId/edit' });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useGetListing(listingId);
  const updateListing = useUpdateListing();
  const { identity } = useInternetIdentity();

  const isOwner = identity && listing && listing.seller.toString() === identity.getPrincipal().toString();

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: PropertyCategory;
    listingType: string;
    quotedPrice: bigint;
    currency: Currency;
    location: string;
  }) => {
    if (!listing) return;
    await updateListing.mutateAsync({
      listingId: listing.id,
      ...data,
      status: listing.status,
    });
    navigate({ to: '/listing/$listingId', params: { listingId } });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing || !isOwner) {
    return (
      <div className="container py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to edit this listing.</p>
          <Button onClick={() => navigate({ to: '/' })}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/listing/$listingId', params: { listingId } })} className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Listing
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Listing</CardTitle>
            <CardDescription>Update your property details and images</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <ListingForm
                  initialData={{
                    title: listing.title,
                    description: listing.description,
                    category: listing.category,
                    listingType: listing.listingType,
                    quotedPrice: listing.quotedPrice,
                    currency: listing.currency,
                    location: listing.location,
                  }}
                  onSubmit={handleSubmit}
                  isSubmitting={updateListing.isPending}
                  submitLabel="Update Listing"
                />
              </TabsContent>
              <TabsContent value="images" className="mt-6">
                <ImageUploader listingId={listing.id} currentImages={listing.images} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
