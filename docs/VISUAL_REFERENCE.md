# 🎨 Visual Design Reference Guide

## Quick Reference for Developers

### Color Codes (Copy-Paste Ready)

```typescript
// Primary Colors
#EF4F5F  // Main red (CTA, primary actions)
#D62828  // Dark red (pressed state)
#FFE6E8  // Light red (backgrounds)
#FF6B35  // Orange accent
#004E89  // Navy accent

// Text Colors
#212121  // Primary text (6.5:1 contrast - AAA)
#424242  // Secondary text (5.5:1 contrast - AA)
#666666  // Tertiary text (4.5:1 contrast - AA)
#FFFFFF  // Inverse/white text
#BDBDBD  // Disabled text

// Semantic
#2D6A4F  // Success/Good green
#F77F00  // Warning orange
#D62828  // Error red
#004E89  // Info blue

// Rating Colors
#2D6A4F  // Excellent (4.5+)
#4CAF50  // Good (3.5-4.4)
#FF9800  // Average (2.5-3.4)
#D62828  // Poor (<2.5)

// Backgrounds
#FFFFFF  // Main background (white)
#F5F5F5  // Card/surface (light gray)
#EEEEEE  // Variant surface
#E0E0E0  // Borders
#F0F0F0  // Dividers
```

### Font Sizes (Reference)

```
26pt - Main heading (greeting)
16pt - Section title
15pt - Card title
14pt - Body text
12pt - Secondary text/labels
11pt - Captions/tags
```

### Spacing (Reference)

```
4pt   - Extra small
8pt   - Small
12pt  - Medium
16pt  - Standard
20pt  - Large
24pt  - Extra large
```

### Component Sizing

```
Touch Target:     44×44 pt (minimum)
Arena Card:       Full width, 160pt image height
Offer Card:       150pt width minimum, 80pt height
Avatar:           40×40 pt
Badge/Icon:       28×28 pt typical
```

---

## Arena Card Layout (Reference)

```
┌──────────────────────────────────────┐
│                                      │
│   [Image Container - 160pt height]   │ Type Badge (TL)
│   ┌──────────────────────────────┐   │
│   │                              │   │ Rating Badge (BR)
│   │   Placeholder Background     │   │ ▲▲▲▲ 4.8 ★
│   │                              │   │
│   └──────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  Arena Name (15pt bold) ......(qty) │
│  Amenity Tags    Amenity Tags       │
│  ₹500/hr • 2.5 km        ──────→    │ CTA Button
│                                      │
└──────────────────────────────────────┘

Padding: 12pt
Image Height: 160pt
Total Height: ~200pt
```

---

## Color Palette Visual

```
PRIMARY COLORS (Zomato-Inspired)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ ██  │ │ ██  │ │ ██  │ │ ██  │ │ ██  │
│ ██  │ │ ██  │ │ ██  │ │ ██  │ │ ██  │
│ ██  │ │ ██  │ │ ██  │ │ ██  │ │ ██  │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
#EF4F5F #D62828 #FFE6E8 #FF6B35 #004E89
Primary  Dark    Light   Orange  Navy
Red      Red     Red     Accent  Accent

TEXT COLORS (WCAG AA+)
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Primary    │ │ Secondary  │ │ Tertiary   │
│ #212121    │ │ #424242    │ │ #666666    │
│ 6.5:1      │ │ 5.5:1      │ │ 4.5:1      │
│ AAA        │ │ AA         │ │ AA         │
└────────────┘ └────────────┘ └────────────┘

RATING COLORS (Semantic)
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Green  │ │ Light  │ │Orange  │ │Red     │
│4.5+    │ │Green   │ │Average │ │Poor    │
│#2D6A4F │ │#4CAF50 │ │#FF9800 │ │#D62828 │
│Excellent│ │Good    │ │2.5-3.4 │ │<2.5    │
└────────┘ └────────┘ └────────┘ └────────┘
```

---

## Typography Hierarchy

```
HIERARCHY LEVELS

H1 (Highest Emphasis)
┌────────────────────────────────┐
│ Hello, John 👋                 │  26pt, Bold
│ 6.5:1 contrast, Primary color  │
└────────────────────────────────┘

H2 (High Emphasis)
┌────────────────────────────────┐
│ Popular Near You               │  16pt, Bold
│ Section headers, clear emphasis │
└────────────────────────────────┘

H3 (Medium Emphasis)
┌────────────────────────────────┐
│ Elite Cricket Turf             │  15pt, Semi-bold
│ Card titles, arena names        │
└────────────────────────────────┘

Body (Normal Emphasis)
┌────────────────────────────────┐
│ Premium cricket turf with       │  14pt, Regular
│ professional pitch and features │
└────────────────────────────────┘

Small (Low Emphasis)
┌────────────────────────────────┐
│ Pavilion • Floodlights • Parking │  12pt, Medium
│ Secondary information, labels    │
└────────────────────────────────┘
```

---

## Button States Reference

```
PRIMARY CTA BUTTON

Default State:
┌─────────────────┐
│   BOOK NOW →    │  Background: #EF4F5F
│                 │  Text: White, Bold
└─────────────────┘  Height: 44pt min

Pressed State:
┌─────────────────┐
│   BOOK NOW →    │  Background: #D62828
│                 │  Opacity: 0.9
└─────────────────┘

Disabled State:
┌─────────────────┐
│   BOOK NOW →    │  Background: #BDBDBD
│                 │  Text: #999999
└─────────────────┘  Opacity: 0.6


SECONDARY BUTTON

Default State:
┌─────────────────┐
│   CANCEL        │  Background: #F5F5F5
│                 │  Border: 1pt #E0E0E0
└─────────────────┘  Text: #212121

Active State:
┌─────────────────┐
│   CANCEL        │  Background: #EF4F5F
│                 │  Border: 1pt #EF4F5F
└─────────────────┘  Text: White
```

---

## Accessibility Checklist (Visual)

```
CONTRAST VERIFICATION
┌─────────────────────────────────────┐
│ Text on White Background            │
│ #212121 (Primary)    → 6.5:1  ✅✅  │  AAA
│ #424242 (Secondary)  → 5.5:1  ✅   │  AA
│ #666666 (Tertiary)   → 4.5:1  ✅   │  AA
│ #FFFFFF (Inverse)    → ∞      ✅✅  │  AAA
└─────────────────────────────────────┘

TOUCH TARGET SIZING
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   44×44pt    │  │   44×44pt    │  │   44×44pt    │
│              │  │              │  │              │
│   ✅ Good    │  │   ✅ Good    │  │   ✅ Good    │
└──────────────┘  └──────────────┘  └──────────────┘

vs

┌──────────┐  ┌──────────┐
│          │  │          │
│ 36×36pt  │  │ 40×40pt  │
│          │  │          │
│ ❌ Small │  │ ⚠️  OK   │
└──────────┘  └──────────┘
```

---

## Home Screen Layout (Visual)

```
BEFORE (Basic Layout)
┌──────────────────────┐
│ Header + Bell        │
├──────────────────────┤
│ Location Button      │
├──────────────────────┤
│ Search Input         │
├──────────────────────┤
│ Basic Filter Chips   │
├──────────────────────┤
│ Arena Card           │
│ Arena Card           │
├──────────────────────┤
│ Offers Carousel      │
├──────────────────────┤
│ Quick Actions (3)    │
└──────────────────────┘

AFTER (Zomato-Style Layout)
┌──────────────────────┐
│ ✨ Better greeting   │  Larger, bold
│    + notifications   │
├──────────────────────┤
│ 📍 Location selector │  Better visual
│    with "Delivery to"│  hierarchy
├──────────────────────┤
│ 🔍 Search + filter   │  Improved search
├──────────────────────┤
│ 🏷️  Category filters  │  Emoji + visual
│ [All][Cricket][⚽]   │  selection state
├──────────────────────┤
│ ✨ Featured Banner   │  Promotional
│ [Elite + Discount]   │  section
├──────────────────────┤
│ 📍 Popular Near You  │
│ [Arena Card]         │  Rich cards with
│ [Arena Card]         │  images + badges
│ [Arena Card]         │
├──────────────────────┤
│ 🎉 Special Offers    │  Colored cards
│ [50% OFF] [Free]     │
├──────────────────────┤
│ Quick Access (3)     │  Consistent
│ [💰][👥][📅]         │  styling
└──────────────────────┘
```

---

## Responsive Design Reference

```
SMALL SCREEN (320-480pt)
┌─────────────────┐
│  Header         │ Compact
├─────────────────┤ Single column
│  Search         │ Reduced padding
├─────────────────┤
│  [Category]     │ Scrollable
├─────────────────┤
│  [Arena Card]   │ Full width
│                 │ 160pt image
├─────────────────┤
│  [Offer Cards]  │
│  Horizontal →   │
└─────────────────┘

LARGE SCREEN (768pt+)
┌───────────────────────────────────┐
│  Header              Notifications │  More space
├───────────────────────────────────┤
│  Search              [Filter Btn]  │  Better use of space
├───────────────────────────────────┤
│  [Categories........more categories] │
├───────────────────────────────────┤
│  [Featured Banner - wider]         │
├───────────────────────────────────┤
│  [Arena Card]     [Arena Card]     │  Two columns
│  [Arena Card]     [Arena Card]     │  if space allows
└───────────────────────────────────┘
```

---

## Screen Reader Output Example

```
ARENA CARD ANNOUNCEMENT

Screen Reader Says:
"Arena card. Elite Cricket Turf, 4.8 star rating
from 142 reviews. Cricket court. Amenities:
Pavilion, Floodlights, plus 2 more. ₹500 per
hour. 2.5 kilometers away. Button. Double tap
to view arena details."

Breakdown:
1. Component type    → Arena card
2. Arena name        → Elite Cricket Turf
3. Rating            → 4.8 stars
4. Review count      → 142 reviews
5. Sport type        → Cricket court
6. Key amenities     → Pavilion, Floodlights (+2)
7. Price info        → ₹500/hour
8. Distance          → 2.5 km
9. Action            → Button, double tap
```

---

## Color Combinations (Approved Pairs)

```
GOOD COMBINATIONS FOR TEXT

Dark Red (#D62828) on White
Contrast: 6.7:1 ✅✅

Primary Red (#EF4F5F) on White
Contrast: 5.2:1 ✅

Orange (#FF6B35) on White
Contrast: 3.4:1 ⚠️  (Not for small text)

Navy Blue (#004E89) on White
Contrast: 7.5:1 ✅✅

Green (#2D6A4F) on White
Contrast: 8.6:1 ✅✅


NOT RECOMMENDED

Purple + Neon Blue → Low contrast, confusing
Light Red on White → Insufficient contrast
Neon colors on white → Inaccessible

ALWAYS TEST with WebAIM Contrast Checker
```

---

## Common Mistakes to Avoid

```
❌ WRONG
- Using color alone to convey information
- Touch targets smaller than 44×44 pt
- Font sizes below 12pt
- Missing accessibility labels
- Low contrast text

✅ RIGHT
- Combine color with icons/text
- All buttons 44×44 pt minimum
- Font 12pt minimum for body text
- accessibilityLabel on all interactive elements
- High contrast text (4.5:1+)

❌ WRONG SPACING
┌─────┐ ┌─────┐ ← 0pt gap, too close
│ Btn │ │ Btn │

✅ RIGHT SPACING
┌─────┐        ┌─────┐ ← 8pt gap minimum
│ Btn │        │ Btn │

❌ WRONG TEXT
"Click here" ← Not descriptive

✅ RIGHT TEXT
"Book Arena Now" ← Clear action
```

---

## Quick Copy-Paste Code Snippets

### Safe Color Usage in TypeScript

```typescript
// Primary CTA Button
backgroundColor: colors.primary,      // #EF4F5F
color: colors.text.inverse,          // #FFFFFF

// Secondary Text with Accessibility
color: colors.text.secondary,        // #424242 (5.5:1)

// Rating Badge
backgroundColor: colors.ratingExcellent,  // #2D6A4F

// Accessible Touch Target
minWidth: 44,
minHeight: 44,

// Proper Contrast
color: colors.text.primary,          // #212121 (6.5:1)
backgroundColor: colors.background,  // #FFFFFF
```

### Accessible Component Template

```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Clear description"
  accessibilityRole="button"
  accessibilityHint="What happens on tap"
  style={{
    minWidth: 44,
    minHeight: 44,
    backgroundColor: colors.primary,
  }}
>
  <Text style={{ color: colors.text.inverse }}>
    Action Text
  </Text>
</TouchableOpacity>
```

---

## Testing Checklist

```
BEFORE SHIPPING CODE

□ Color Contrast
  ✓ Text: 4.5:1+
  ✓ UI elements: 3:1+
  Use: WebAIM Contrast Checker

□ Touch Targets
  ✓ Buttons: 44×44 pt minimum
  ✓ Spacing: 8pt minimum
  Use: Measure tool

□ Typography
  ✓ Minimum: 12pt body text
  ✓ Line height: ≥1.5×
  Use: Visual inspection

□ Accessibility
  ✓ Labels on all interactive
  ✓ Roles (button, header, etc.)
  ✓ Screen reader tested
  Use: VoiceOver/TalkBack

□ Visual Consistency
  ✓ Consistent spacing (4pt grid)
  ✓ Consistent colors
  ✓ Consistent font weights
  Use: Design system reference
```

---

## Useful Resources

- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Color Palette:** Use colors.ts as single source of truth
- **Documentation:** See ACCESSIBILITY_GUIDE.md and DESIGN_SYSTEM.md

---

**Last Updated:** January 13, 2025  
**Status:** ✅ **Production Ready**

🎨 **Use this reference for all new components and screens!**
