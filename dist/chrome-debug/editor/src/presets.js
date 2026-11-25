// Common site sizes for fixed-frame cropping. Brand names are not translated.
// Sizes are starting points; check each site's current recommendation.
export const CROP_PRESETS = [
  { id: 'profile', name: 'Profile', w: 400, h: 400 },
  { id: 'square', name: 'Square post', w: 1080, h: 1080 },
  { id: 'post', name: 'Portrait post 4:5', w: 1080, h: 1350 },
  { id: 'story', name: 'Story / Reel 9:16', w: 1080, h: 1920 },
  { id: 'thumb', name: 'Video thumbnail', w: 1280, h: 720 },
  { id: 'xheader', name: 'X header', w: 1500, h: 500 },
  { id: 'linkedin', name: 'LinkedIn banner', w: 1584, h: 396 },
  { id: 'fbcover', name: 'Facebook cover', w: 820, h: 312 },
  { id: 'pin', name: 'Pinterest pin 2:3', w: 1000, h: 1500 },
  { id: 'card', name: 'Link preview 1.91:1', w: 1200, h: 628 },
];

export function findPreset(id) {
  return CROP_PRESETS.find((p) => p.id === id) || null;
}
