import sharp from 'sharp';
// Rebuild the checked-in social card after editing the vector source.
await sharp('public/images/social-card.svg').png().toFile('public/images/social-card.png');
console.log('Generated public/images/social-card.png (1200 × 630).');
