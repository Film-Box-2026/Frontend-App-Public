export const getWebpImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  const encodedUrl = encodeURIComponent(imageUrl);
  return `https://phimapi.com/image.php?url=${encodedUrl}`;
};
