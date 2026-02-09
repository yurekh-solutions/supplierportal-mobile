/**
 * Image utility functions for product image handling
 */

export const BROKEN_IMAGE_PATTERNS = [
  'gc_sheets_corrugated',
  'ms_hollow_sections',
  'ms_plates_grade_a',
  'tmt_bars_fe_500d',
  'ss_304_sheets',
  'copper_tubes',
  'premium_plywood',
  'polycab_frls_cables',
];

/**
 * Get a sanitized and valid image URL
 * Returns null if the image is known to be broken or missing
 */
export const getImageUrl = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl || imageUrl.trim() === '') return null;

  // Skip known broken images
  for (const pattern of BROKEN_IMAGE_PATTERNS) {
    if (imageUrl.includes(pattern)) {
      console.log('⚠️ Skipping known broken image: ' + pattern);
      return null;
    }
  }

  const API_BASE =
    process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') ||
    'https://backendmatrix.onrender.com';

  // If URL contains filesystem paths like /opt/render/project/src/uploads/, extract just the /uploads/ part
  if (imageUrl.includes('/uploads/')) {
    const uploadsIndex = imageUrl.indexOf('/uploads/');
    const cleanPath = imageUrl.substring(uploadsIndex);
    return API_BASE + cleanPath;
  }

  // If it's a Cloudinary URL or other external URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Check if it's NOT a malformed URL with filesystem paths
    if (!imageUrl.includes('/opt/') && !imageUrl.includes('/render/')) {
      return imageUrl;
    }
  }

  // Relative URL - prepend API base
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
  return API_BASE + cleanPath;
};

/**
 * Check if an image URL is valid (not in broken list)
 */
export const isImageValid = (imageUrl: string | undefined | null): boolean => {
  return getImageUrl(imageUrl) !== null;
};
