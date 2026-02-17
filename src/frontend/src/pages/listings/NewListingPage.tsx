import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateListing } from '../../hooks/useQueries';
import ListingForm from '../../components/listings/ListingForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PropertyCategory, Currency, ListingStatus } from '../../backend';

export default function NewListingPage() {
  const navigate = useNavigate();
  const createListing = useCreateListing();

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: PropertyCategory;
    listingType: string;
    quotedPrice: bigint;
    currency: Currency;
    location: string;
  }) => {
    const listingId = await createListing.mutateAsync(data);
    navigate({ to: `/listing/${listingId.toString()}/edit` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Listing</CardTitle>
            <CardDescription>Fill in the details to list your property</CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm onSubmit={handleSubmit} isSubmitting={createListing.isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
