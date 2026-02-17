import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { ExternalBlob } from '../../backend';

interface ImageGalleryProps {
  images: ExternalBlob[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const displayImages =
    images.length > 0
      ? images.map((img) => img.getDirectURL())
      : ['/assets/generated/property-placeholder.dim_1200x800.png'];

  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((url, index) => (
            <CarouselItem key={index}>
              <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                <img src={url} alt={`Property image ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayImages.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
      {images.length > 1 && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </div>
      )}
    </div>
  );
}
