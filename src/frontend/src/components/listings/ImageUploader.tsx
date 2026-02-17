import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUploadListingImages } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImageUploaderProps {
  listingId: bigint;
  currentImages: ExternalBlob[];
}

export default function ImageUploader({ listingId, currentImages }: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const uploadImages = useUploadListingImages();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const blobs = await Promise.all(
      selectedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        return ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      })
    );

    await uploadImages.mutateAsync({ listingId, images: blobs });
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="images">Current Images</Label>
          {currentImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {currentImages.map((img, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img.getDirectURL()} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg mt-2">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No images uploaded yet</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="images">Upload New Images</Label>
          <div className="flex items-center gap-2">
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('images')?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Select Images
            </Button>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-muted-foreground">{selectedFiles.length} file(s) selected</span>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">{uploadProgress}% uploaded</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadImages.isPending}
            className="w-full"
          >
            {uploadImages.isPending ? 'Uploading...' : 'Upload Images'}
          </Button>
        </div>
      </div>
    </div>
  );
}
