# CrushIT Accessibility Guide

## Overview
CrushIT is designed to be accessible to all users, including those with visual, auditory, motor, or cognitive disabilities. We follow WCAG 2.1 Level AA standards.

---

## Accessibility Features

### 1. **Screen Reader Support**
- **VoiceOver (iOS)** and **TalkBack (Android)** fully supported
- All interactive elements have descriptive labels
- Semantic roles assigned to all components
- Images have alternative text descriptions
- Dynamic content announces changes

**Example Usage:**
```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Book Arena"
  accessibilityHint="Double tap to open booking details"
>
  <Text>Book Now</Text>
</TouchableOpacity>
```

---

### 2. **Touch Target Sizes**
All interactive elements meet minimum size requirements:
- **Minimum:** 44x44 dp (WCAG 2.5.5)
- **Recommended:** 48x48 dp for comfort
- **Large Actions:** 52x52 dp for primary buttons
- **Critical Actions:** 56x56 dp for destructive actions

**Implementation:**
```typescript
import { TOUCH_TARGET } from '@/constants/accessibility';

<TouchableOpacity
  style={{
    minWidth: TOUCH_TARGET.MINIMUM,
    minHeight: TOUCH_TARGET.MINIMUM,
  }}
/>
```

---

### 3. **Text Scaling**
- Supports text scaling from **85% to 200%**
- Adjustable via Settings → Accessibility → Text Size
- All text elements use relative sizing
- Layouts adapt to larger text

**Enable Dynamic Text:**
```typescript
import { useAccessibility } from '@/hooks/useAccessibility';

const { getScaledSize } = useAccessibility();

<Text style={{ fontSize: getScaledSize(16) }}>
  Scalable Text
</Text>
```

---

### 4. **High Contrast Mode**
- Increases border width by 2x
- Boosts font weight by 100
- Improves visibility for low vision users
- Accessible via Settings → Accessibility

**Features:**
- Thicker borders on all UI elements
- Bolder text throughout app
- Enhanced focus indicators
- Improved button outlines

---

### 5. **Color Accessibility**

#### Color-Blind Safe Palette
We use colors distinguishable by all types of color vision deficiency:
- **Blue** (#0077BB) - Safe for Protanopia/Deuteranopia
- **Orange** (#EE7733) - Safe for Protanopia/Deuteranopia
- **Green** (#009988) - Alternative green
- **Purple** (#AA3377) - Safe for Tritanopia
- **Yellow** (#CCBB44) - Universal

#### Never Rely on Color Alone
- Errors use icons + text (not just red)
- Success uses checkmarks + text
- Game status uses badges + emoji
- Leaderboard medals use emoji + borders

---

### 6. **Motion & Animation**

#### Respects Reduce Motion Preference
- System setting automatically detected
- Animations disabled when enabled
- Instant transitions replace animations
- Status displayed in Settings

**Implementation:**
```typescript
const { getAnimationDuration } = useAccessibility();

<Animated.View
  style={{
    duration: getAnimationDuration(300), // Returns 0 if reduce motion enabled
  }}
/>
```

---

### 7. **Keyboard & Focus Management**

#### Focus Indicators
- 3px blue outline (#4A90E2)
- 2px offset from element
- Visible on all interactive elements
- Moves logically through screen

#### Tab Order
- Follows visual order (top to bottom, left to right)
- Skip links available for long lists
- Focus trapped in modals
- Returns focus after modal closes

---

### 8. **Alternative Text for Images**

All images have descriptive alternative text:

```typescript
// Product Images
<Image
  source={{ uri: productImage }}
  accessibilityLabel={`${productName} product image`}
  accessibilityRole="image"
/>

// Game Icons
<Image
  source={cricketIcon}
  accessibilityLabel="Cricket game icon"
  accessibilityRole="image"
/>

// Decorative Images
<Image
  source={backgroundPattern}
  accessibilityRole="none"
  accessibilityElementsHidden={true}
/>
```

---

### 9. **Form Accessibility**

#### Input Fields
- Clear labels for all fields
- Error messages announced immediately
- Validation feedback is descriptive
- Required fields marked

**Example:**
```typescript
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to login"
  accessibilityRequired={true}
  placeholder="email@example.com"
/>
```

#### Error Handling
- Errors announced with `accessibilityLiveRegion="assertive"`
- Icons + text describe errors
- Focus moves to error field
- Clear instructions to fix

---

### 10. **Scoring System Accessibility**

#### Game Creation
- Sport selection: Radio buttons with labels
- Player fields: Numbered "Player 1", "Player 2" etc.
- Game type: Clearly labeled "Tournament" or "Practice"
- All buttons 44px minimum

#### Score Entry
- Plus/minus buttons: 44px circular, clear labels
- Direct input: Number keyboard, "Score for [Player Name]"
- Leading indicator: "Leading!" announced
- Save/Complete buttons: 52px, descriptive

#### Game Summary
- Winner announced: "[Player Name] is the champion with [score] points"
- Leaderboard: Each position announced: "Position 1, [Player], [score] points"
- Medals: "Gold medal", "Silver medal", "Bronze medal"
- Share button: "Share game results"

---

## Testing Accessibility

### Manual Testing Checklist

#### Screen Reader Testing
- [ ] Enable VoiceOver (iOS) or TalkBack (Android)
- [ ] Navigate through entire app
- [ ] Verify all elements are announced
- [ ] Check announcement order is logical
- [ ] Ensure images have alt text
- [ ] Test form submission with errors

#### Keyboard Navigation (Android with external keyboard)
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Check focus order is logical
- [ ] Ensure no keyboard traps
- [ ] Test modal focus trapping

#### Text Scaling
- [ ] Set text size to 200% in Settings
- [ ] Navigate all screens
- [ ] Verify no text truncation
- [ ] Check buttons don't break
- [ ] Ensure lists remain scrollable

#### High Contrast Mode
- [ ] Enable in Settings → Accessibility
- [ ] Verify borders are thicker
- [ ] Check text is bolder
- [ ] Ensure all UI remains usable

#### Reduce Motion
- [ ] Enable in system settings
- [ ] Verify animations disabled
- [ ] Check transitions are instant
- [ ] Ensure no essential info lost

#### Color Blindness Simulation
- [ ] Use color blindness simulator
- [ ] Test with Protanopia (red-blind)
- [ ] Test with Deuteranopia (green-blind)
- [ ] Test with Tritanopia (blue-blind)
- [ ] Verify icons/patterns used, not just color

---

## Accessibility Compliance

### WCAG 2.1 Level AA
✅ **Perceivable**
- Text alternatives for images
- Captions for media
- Adaptable layouts
- 4.5:1 contrast ratio

✅ **Operable**
- Keyboard accessible
- Sufficient time for tasks
- No seizure-inducing content
- Easy navigation

✅ **Understandable**
- Readable text
- Predictable behavior
- Input assistance
- Error identification

✅ **Robust**
- Compatible with assistive tech
- Valid semantic HTML/native components
- Status messages announced
- Name, role, value exposed

---

## Common Accessibility Patterns

### Modal Dialogs
```typescript
<Modal
  visible={visible}
  accessible={true}
  accessibilityViewIsModal={true}
  onRequestClose={onClose}
>
  <View
    accessibilityRole="alert"
    accessibilityLabel="Game created successfully"
  >
    {/* Modal content */}
  </View>
</Modal>
```

### Buttons
```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Create new game"
  accessibilityHint="Opens game creation form"
  accessibilityState={{ disabled: isDisabled }}
  style={{ minHeight: TOUCH_TARGET.MINIMUM }}
>
  <Text>Create Game</Text>
</TouchableOpacity>
```

### Lists
```typescript
<FlatList
  data={games}
  accessibilityRole="list"
  renderItem={({ item, index }) => (
    <View accessibilityRole="listitem">
      <Text>{item.name}</Text>
    </View>
  )}
/>
```

### Toggle Switches
```typescript
<Switch
  value={enabled}
  onValueChange={setEnabled}
  accessibilityRole="switch"
  accessibilityLabel="Enable scoring"
  accessibilityState={{ checked: enabled }}
/>
```

---

## Resources

### Tools
- **React Native Accessibility Inspector** - Built into React Native debugger
- **Accessibility Scanner (Android)** - Google Play
- **Accessibility Inspector (iOS)** - Xcode
- **axe DevTools** - Browser extension for web views

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility)

---

## User Settings

Users can customize accessibility in **Settings → Accessibility**:
1. **Text Size** - Slider from 85% to 200%
2. **High Contrast Mode** - Toggle for better visibility
3. **Screen Reader Status** - Shows if VoiceOver/TalkBack active
4. **Reduce Motion Status** - Shows if system reduce motion enabled

---

## Reporting Accessibility Issues

If you encounter accessibility barriers:
1. Navigate to Settings → Help & Support
2. Select "Report Accessibility Issue"
3. Describe the barrier encountered
4. Include device and assistive technology used
5. Our team will respond within 24 hours

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Compliance:** WCAG 2.1 Level AA
