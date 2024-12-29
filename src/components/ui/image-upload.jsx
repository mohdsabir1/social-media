'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function ImageUpload({
  onUpload,
  defaultImage,
  className,
  aspectRatio = "aspect-square",
  size = { width: 150, height: 150 },
  type = "profile"
}) {
  const [preview, setPreview] = useState(defaultImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError('');
    setLoading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload file
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Call onUpload callback with the response
      onUpload?.(data);
    } catch (err) {
      setError(err.message);
      setPreview(defaultImage);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-border",
          aspectRatio,
          loading && "opacity-50"
        )}
        style={{ width: size.width, height: size.height }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Upload preview"
            className="object-cover"
            fill
            sizes={`${Math.max(size.width, size.height)}px`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </div>
        ) : (
          'Upload Image'
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
