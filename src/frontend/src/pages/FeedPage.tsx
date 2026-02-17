import { useState, useMemo } from 'react';
import { useFetchRandomListings } from '../hooks/useQueries';
import ListingCard from '../components/listings/ListingCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function FeedPage() {
  const { data: listings = [], isLoading } = useFetchRandomListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.location.toLowerCase().includes(searchLower);

      const matchesType = typeFilter === 'all' || listing.listingType.toLowerCase() === typeFilter.toLowerCase();

      const price = Number(listing.quotedPrice);
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [listings, searchQuery, typeFilter, minPrice, maxPrice]);

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Property Type</Label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger id="type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="home">Home</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="minPrice">Min Price (₹)</Label>
        <Input
          id="minPrice"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxPrice">Max Price (₹)</Label>
        <Input
          id="maxPrice"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="No limit"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Your Dream Property</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover premium lands and newly built homes across India
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location, or description..."
                className="pl-10"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 md:w-auto">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Properties</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterControls />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="/assets/generated/no-results.dim_900x600.png"
              alt="No results"
              className="w-full max-w-md mb-6 opacity-80"
            />
            <h3 className="text-2xl font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || typeFilter !== 'all' || minPrice || maxPrice
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'No properties are currently listed. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id.toString()} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
