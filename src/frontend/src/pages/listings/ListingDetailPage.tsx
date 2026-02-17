import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Edit, MessageCircle, HandCoins, ArrowLeft } from 'lucide-react';
import { formatINR, formatDate } from '../../utils/format';
import ImageGallery from '../../components/listings/ImageGallery';
import ContactSellerDialog from '../../components/messages/ContactSellerDialog';
import MakeOfferDialog from '../../components/offers/MakeOfferDialog';
import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function ListingDetailPage() {
  const { listingId } = useParams({ from: '/listing/$listingId' });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useGetListing(listingId);
  const { identity } = useInternetIdentity();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const isOwner = identity && listing && listing.seller.toString() === identity.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate({ to: '/' })}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={listing.images} />

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{listing.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {listing.listingType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {formatDate(listing.createdTimestamp)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-4">{formatINR(listing.quotedPrice)}</div>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Status: {listing.status}
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Category: {listing.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {isOwner ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate({ to: '/listing/$listingId/edit', params: { listingId } })}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Interested?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setContactDialogOpen(true)} className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contact Seller
                  </Button>
                  <Button onClick={() => setOfferDialogOpen(true)} variant="outline" className="w-full gap-2">
                    <HandCoins className="h-4 w-4" />
                    Make an Offer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ContactSellerDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        listingId={listing.id}
        listingTitle={listing.title}
      />
      <MakeOfferDialog
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        listing={listing}
      />
    </div>
  );
}
