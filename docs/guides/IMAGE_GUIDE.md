# 🎮 Image Management Guide - CrushIT App

## Overview

This guide documents how images are integrated into the CrushIT app, including arena images, game icons, and product visuals.

---

## 📁 Image Directory Structure

```
app/public/images/
├── arenas/                 # Arena/Game venue images
│   ├── cricket.svg        # Cricket turf visualization
│   ├── football.svg       # Football/soccer arena
│   ├── badminton.svg      # Badminton court
│   ├── tennis.svg         # Tennis court
│   ├── basketball.svg     # Basketball court
│   └── squash.svg         # Squash stadium
├── games/                 # Game icons and illustrations
├── products/              # Product catalog images
└── icons/                 # UI icons and badges (future)
```

---

## 🎨 Arena Images

### Available Arenas

| Arena Type | Image File | Description | Rating |
|-----------|-----------|-------------|--------|
| Cricket | `cricket.svg` | Professional cricket turf with pavilion | ⭐ 4.8 |
| Football | `football.svg` | FIFA-size football ground | ⭐ 4.5 |
| Badminton | `badminton.svg` | Air-conditioned badminton courts | ⭐ 4.7 |
| Tennis | `tennis.svg` | Clay and hard courts | ⭐ 4.6 |
| Basketball | `basketball.svg` | Indoor basketball courts | ⭐ 4.4 |
| Squash | `squash.svg` | World-class squash courts | ⭐ 4.9 |

### Image Features

Each SVG image includes:
- ✅ Realistic court/arena visualization
- ✅ Equipment and fixtures shown
- ✅ Lighting systems depicted
- ✅ Accurate proportions and layout
- ✅ Game-specific markings and lines
- ✅ Spectator areas/facilities
- ✅ Arena name label at bottom

### Technical Specs

- **Format**: SVG (Scalable Vector Graphics)
- **Size**: 400x250px viewBox
- **Scalability**: Automatically scales to fit containers
- **File Size**: ~2-3KB per image (highly optimized)
- **Colors**: Game-accurate and brand-aligned

---

## 🔗 Image Integration

### Backend (arenas.ts)

All arena data now references SVG images:

```typescript
{
  id: '1',
  name: 'Elite Cricket Turf',
  type: 'cricket',
  images: ['/images/arenas/cricket.svg'],  // Local SVG image
  rating: 4.8,
  // ... other properties
}
```

### Frontend (React Native)

Images are retrieved using utility functions:

```typescript
import { getArenaImage } from '@/utils/imageUtils';

// Get image source for a specific arena type
const imageSource = getArenaImage('cricket');

// In Image component
<Image
  source={imageSource}
  style={styles.image}
  resizeMode="cover"
/>
```

---

## 🛠️ Image Utilities (imageUtils.ts)

Located at: `app/src/utils/imageUtils.ts`

### Key Functions

#### `getArenaImage(type: string)`
```typescript
// Returns the image source for an arena type
const cricketImage = getArenaImage('cricket');
// Returns: require('@/../public/images/arenas/cricket.svg')
```

#### `getArenaImageUri(type: string)`
```typescript
// Returns the URI path for API calls
const uri = getArenaImageUri('football');
// Returns: '/images/arenas/football.svg'
```

#### `getArenaTypeLabel(type: string)`
```typescript
// Returns display name with emoji
const label = getArenaTypeLabel('badminton');
// Returns: '🏸 Badminton'
```

#### `getArenaTypeColors(type: string)`
```typescript
// Returns color scheme for the arena type
const colors = getArenaTypeColors('tennis');
// Returns: { primary: '#D2691E', light: '#F0E68C' }
```

#### `getArenaFeatures(type: string)`
```typescript
// Returns array of arena features with emojis
const features = getArenaFeatures('cricket');
// Returns: ['🏟️ Professional Pitch', '💡 Floodlights', ...]
```

### Constants Available

**ARENA_IMAGES**
- Maps arena type → image source
- All 6 game types included

**ARENA_TYPE_LABELS**
- Maps arena type → display name with emoji
- Used for UI labels and headers

**ARENA_TYPE_COLORS**
- Color schemes for each arena type
- `primary` and `light` variants for UI flexibility

**ARENA_FEATURES**
- Pre-defined amenities for each arena
- Includes emoji icons for visual appeal

---

## 📱 Components Using Images

### ArenaCard
- **Location**: `app/src/components/ArenaCard.tsx`
- **Displays**: Arena image (160px height) with badges
- **Features**: Rating badge, type badge overlay
- **Responsive**: Auto-scales with container

```typescript
<Image
  source={arenaImageUri}
  style={styles.image}
  resizeMode="cover"
/>
```

### ArenaDetailsScreen
- **Location**: `app/src/screens/ArenaDetailsScreen.tsx`
- **Displays**: Full arena image at top of details
- **Size**: Full width, 250px height
- **Features**: Clickable, shows arena details below

```typescript
<Image
  source={arenaImageUri}
  style={styles.image}
/>
```

---

## 🎯 Usage Examples

### Display Arena with Image
```typescript
import { ArenaCard } from '@/components';
import { getArenaImage, getArenaTypeLabel } from '@/utils/imageUtils';

// In your component
const arena = {
  id: '1',
  name: 'Elite Cricket Turf',
  type: 'cricket',
  images: ['/images/arenas/cricket.svg'],
  rating: 4.8,
  pricing: 500,
  distance: '2.5 km',
};

<ArenaCard arena={arena} onPress={() => navigate('ArenaDetails')} />
```

### Get Image for Dynamic Display
```typescript
import { getArenaImage } from '@/utils/imageUtils';

const [arenaType, setArenaType] = useState('cricket');
const imageSource = getArenaImage(arenaType);

<Image source={imageSource} style={styles.arenaImage} />
```

### Display with Type Label
```typescript
import { getArenaTypeLabel } from '@/utils/imageUtils';

const label = getArenaTypeLabel(arena.type);
// Result: '🏏 Cricket'

<Text>{label}</Text>
```

---

## 📐 Image Sizing Guidelines

### Responsive Sizes

| Component | Width | Height | Use Case |
|-----------|-------|--------|----------|
| List Card | 100% | 160px | Arena card in list |
| Details Screen | 100% | 250px | Full arena details |
| Small Thumbnail | 80px | 80px | Quick preview |
| Banner | 100% | 200px | Header/hero image |

### Media Query Approach
```typescript
const isSmallScreen = width < 375;
const imageHeight = isSmallScreen ? 140 : 160;

<Image
  source={imageSource}
  style={{ height: imageHeight, width: '100%' }}
/>
```

---

## 🎨 Image Styling

### Common Patterns

```typescript
// Round corners on image
const styles = StyleSheet.create({
  arenaImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
});

// With overlay badges
<View style={styles.imageContainer}>
  <Image source={imageSource} style={styles.image} />
  <View style={styles.ratingBadge}>
    <Text>⭐ 4.8</Text>
  </View>
</View>
```

### Fallback Handling
```typescript
// SVG to URI conversion
const imageSource = typeof arenaImageUri === 'string' && arenaImageUri.startsWith('/')
  ? { uri: arenaImageUri }
  : arenaImageUri;

<Image source={imageSource} />
```

---

## 📊 Arena Image Data Mapping

### Backend Data Updated
All 6 arenas in `backend/src/data/arenas.ts` now include:
```typescript
images: ['/images/arenas/{type}.svg']
```

### Frontend Default Images
If no image is provided, uses arena type:
```typescript
const image = arena.images?.[0] || getArenaImage(arena.type);
```

---

## 🚀 Adding New Images

### To Add a New Arena Type

1. **Create SVG Image**
   - Dimensions: 400x250px viewBox
   - Save to: `app/public/images/arenas/{type}.svg`

2. **Update imageUtils.ts**
   ```typescript
   // Add to ARENA_IMAGES
   export const ARENA_IMAGES: Record<string, string> = {
     // ... existing
     yourtype: require('@/../public/images/arenas/yourtype.svg'),
   };

   // Add to TYPE_LABELS
   export const ARENA_TYPE_LABELS: Record<string, string> = {
     // ... existing
     yourtype: '🎮 Your Type',
   };

   // Add to TYPE_COLORS
   export const ARENA_TYPE_COLORS = {
     // ... existing
     yourtype: { primary: '#color', light: '#lightcolor' },
   };

   // Add to FEATURES
   export const ARENA_FEATURES = {
     // ... existing
     yourtype: ['Feature 1', 'Feature 2', ...],
   };
   ```

3. **Update Backend Data**
   - Add arena entry to `backend/src/data/arenas.ts`
   - Include `images: ['/images/arenas/yourtype.svg']`

4. **Test**
   - Verify image displays in ArenaCard
   - Check ArenaDetailsScreen
   - Test on different screen sizes

---

## 🎨 SVG Image Details

### Cricket Arena
- **Features**: Professional pitch, pavilion, stumps, floodlights
- **Colors**: Green field, brown pavilion, golden lights
- **Special**: Cricket-specific markings and boundaries

### Football Arena
- **Features**: FIFA-size ground, goals, center circle, grandstand
- **Colors**: Green grass, white lines, brown stands
- **Special**: Goal posts and light rays

### Badminton Court
- **Features**: AC units, net, service boxes, court lines
- **Colors**: Wooden floor, light ceiling, net in center
- **Special**: Dimmed lighting effect, ceiling details

### Tennis Court
- **Features**: Clay court, net, service boxes, umpire chair
- **Colors**: Orange/brown clay, white lines, wood stands
- **Special**: Tennis ball icon, serves zones marked

### Basketball Court
- **Features**: Indoor setup, baskets, scoring board, lights
- **Colors**: Wooden floor, red rims, yellow lights
- **Special**: Free throw lanes, center circle, shot clock

### Squash Stadium
- **Features**: Climate control, walls, service box, court lines
- **Colors**: Light walls, wooden floor, premium AC units
- **Special**: Premium badge, red ball illustration

---

## 💡 Best Practices

1. **Always Use Utility Functions**
   - Don't hardcode image paths
   - Use `getArenaImage()` for consistency

2. **Provide Fallbacks**
   - Always have default image for unknown types
   - Handle missing images gracefully

3. **Optimize Performance**
   - SVG format is lightweight
   - No need to resize server-side
   - Client scales automatically

4. **Accessibility**
   - All images have alt text via accessibility labels
   - Images have semantic meaning through type

5. **Maintenance**
   - Keep imageUtils.ts as single source of truth
   - Update both backend and frontend when adding images
   - Document new image types

---

## 🔄 Image Update Workflow

### When Adding New Arena

1. Create SVG image file
2. Place in `public/images/arenas/`
3. Add to `imageUtils.ts` (4 constants)
4. Update backend `arenas.ts` data
5. Test in app

**Estimated Time**: 10-15 minutes

---

## 📚 Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `backend/src/data/arenas.ts` | Updated 6 arenas with SVG paths | Connect data to images |
| `app/src/components/ArenaCard.tsx` | Added Image component, import utils | Display images in lists |
| `app/src/screens/ArenaDetailsScreen.tsx` | Import utils, use getArenaImage() | Display hero images |
| `app/src/utils/imageUtils.ts` | **NEW** 200+ lines | Image utilities & mapping |
| `app/public/images/arenas/*.svg` | **NEW** 6 SVG files | Game arena visualizations |

---

## 🎯 Future Enhancements

- [ ] Product images in shop
- [ ] Pet care service images
- [ ] User profile image uploads
- [ ] Image carousel for arenas
- [ ] Dark mode image variants
- [ ] Image caching strategy
- [ ] WebP format optimization
- [ ] Cloudinary integration (optional)

---

## 📞 Support

For image-related questions or to add new images:
1. Check `imageUtils.ts` for available utilities
2. Review this guide's "Adding New Images" section
3. Ensure SVG dimensions (400x250px)
4. Test on multiple screen sizes

---

# ✨ Image Integration Complete!

Your app now has:
- ✅ 6 high-quality SVG arena images
- ✅ Smart image utility system
- ✅ Proper image fallbacks
- ✅ Responsive image sizing
- ✅ Optimized file sizes
- ✅ Easy to extend

**Status**: 🟢 READY TO USE
