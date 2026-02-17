import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCategory, Currency } from '../../backend';

interface ListingFormData {
  title: string;
  description: string;
  category: PropertyCategory;
  listingType: string;
  quotedPrice: bigint;
  currency: Currency;
  location: string;
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ListingForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Create Listing' }: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<PropertyCategory>(initialData?.category || PropertyCategory.residential);
  const [listingType, setListingType] = useState(initialData?.listingType || 'Land');
  const [quotedPrice, setQuotedPrice] = useState(initialData?.quotedPrice ? Number(initialData.quotedPrice).toString() : '');
  const [location, setLocation] = useState(initialData?.location || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      category,
      listingType,
      quotedPrice: BigInt(quotedPrice),
      currency: Currency.rupees,
      location,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Property Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Spacious 3BHK Villa in Bangalore"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="listingType">Property Type *</Label>
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger id="listingType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Land">Land</SelectItem>
              <SelectItem value="Home">Home</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as PropertyCategory)}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PropertyCategory.residential}>Residential</SelectItem>
              <SelectItem value={PropertyCategory.commercial}>Commercial</SelectItem>
              <SelectItem value={PropertyCategory.land}>Land</SelectItem>
              <SelectItem value={PropertyCategory.agriculture}>Agriculture</SelectItem>
              <SelectItem value={PropertyCategory.newDevelopment}>New Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Whitefield, Bangalore, Karnataka"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quotedPrice">Price (₹) *</Label>
        <Input
          id="quotedPrice"
          type="number"
          value={quotedPrice}
          onChange={(e) => setQuotedPrice(e.target.value)}
          placeholder="e.g., 5000000"
          required
          min="0"
        />
        <p className="text-xs text-muted-foreground">Enter the price in Indian Rupees</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your property in detail..."
          rows={6}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
