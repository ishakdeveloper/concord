import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/uploadthing`,
});
export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/uploadthing`,
});
