import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { Listing } from '../../backend';
import { formatINR } from '../../utils/format';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl =
    listing.images.length > 0
      ? listing.images[0].getDirectURL()
      : '/assets/generated/property-placeholder.dim_1200x800.png';

  return (
    <Link to="/listing/$listingId" params={{ listingId: listing.id.toString() }} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {listing.listingType}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="text-2xl font-bold text-primary">{formatINR(listing.quotedPrice)}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
