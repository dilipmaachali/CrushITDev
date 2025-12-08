# CrushIT Styling - Quick Reference Card

## 🎨 Color Palette (Copy & Paste)

```typescript
// Primary
primary: '#EF4F5F'        // Main color
primaryDark: '#D62828'    // Darker variant
primaryLight: '#FFE6E8'   // Light variant

// Semantic
success: '#2D6A4F'    // Confirmations
warning: '#F77F00'    // Cautions
error: '#D62828'      // Errors
info: '#004E89'       // Information

// Neutral
white: '#FFFFFF'      // Backgrounds
surface: '#F5F5F5'    // Card backgrounds
border: '#E0E0E0'     // Borders
text: '#212121'       // Primary text
```

---

## 📏 Spacing Shortcuts

```typescript
// Quick spacing values (in pixels)
4   // xs - Minimal gaps
8   // sm - Small spacing
12  // md - Default padding
16  // lg - Standard padding (most common)
24  // xl - Large sections
32  // xxl - Extra large spacing
48  // xxxl - Maximum spacing
```

**Usage:**
- Component padding: `lg` (16px)
- Section margins: `lg` or `xl` (16-24px)
- Small gaps: `sm` or `md` (8-12px)

---

## 🎯 Border Radius Shortcuts

```typescript
4      // sm - Minimal radius
8      // md - Standard (buttons, inputs)
12     // lg - Cards, components
16     // xl - Large sections
999    // full - Circular elements
```

---

## 💬 Common Shadows

```typescript
// Subtle shadow (buttons, small cards)
shadowColor: '#00000015'
shadowOffset: { width: 0, height: 1 }
shadowRadius: 2

// Default shadow (cards)
shadowColor: '#00000024'
shadowOffset: { width: 0, height: 4 }
shadowRadius: 8
elevation: 4

// Prominent shadow (modals)
shadowColor: '#00000026'
shadowOffset: { width: 0, height: 8 }
shadowRadius: 12
elevation: 8
```

---

## 🔤 Font Sizes & Weights

```
Headings:
  h1: 32px, 700
  h2: 28px, 700
  h3: 24px, 700
  h4: 20px, 600

Body:
  body1: 16px, 400
  body2: 14px, 400
  button: 16px, 600

Small:
  caption: 12px, 400
  overline: 11px, 600
```

---

## ✨ Component Snippets

### Modern Button
```typescript
{
  backgroundColor: colors.primary,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  ...shadows.sm,
}
```

### Modern Card
```typescript
{
  backgroundColor: colors.white,
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadows.md,
}
```

### Modern Input
```typescript
{
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 16,
}
```

### Chat Bubble
```typescript
{
  maxWidth: '85%',
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 10,
  ...shadows.sm,
}
```

---

## 🎨 Color Combinations

| Use Case | Color | Text Color |
|----------|-------|-----------|
| Primary CTA | `primary` | `white` |
| Secondary Button | `surface` | `primary` |
| Success State | `success` | `white` |
| Warning State | `warning` | `white` |
| Error State | `error` | `white` |
| Disabled | `#BDBDBD` | `#999999` |

---

## 📐 Touch Target Sizes

```
Minimum: 44x44px (accessibility standard)
Button: 44px height minimum
Icon: 24-32px
Input field: 44px height minimum
```

---

## ⚡ Pro Tips

1. **Spacing**: Use multiples of 4px (4, 8, 12, 16, 24...)
2. **Radius**: Use consistent values (8px for buttons, 12px for cards)
3. **Shadows**: Use the shadow constants from styles.ts
4. **Colors**: Use semantic colors (success, error, warning)
5. **Typography**: Maintain hierarchy with weight (600/700 for headers)

---

## 🔄 Design System Location

```
app/src/theme/
├── colors.ts      # Color palette
├── styles.ts      # Design tokens ✨ NEW
└── index.ts       # Exports
```

---

## 📱 Responsive Breakpoints

```
Small phone:  320px
Normal phone: 375px
Large phone:  414px+
Tablet:       768px+
Desktop:      1024px+
```

---

## 🎯 Accessibility Standards

✅ WCAG AA Compliant
- Text contrast: 4.5:1 minimum
- Font size: 14px minimum (body)
- Touch targets: 44px minimum
- Line height: 1.5x or better

---

## 🚀 Quick Start Template

```typescript
import { colors } from '@/theme';
import { spacing, borderRadius, shadows } from '@/theme/styles';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
});
```

---

## 📞 Need Help?

Check these files:
- **STYLING_GUIDE.md** - Complete reference
- **DESIGN_TOKENS.md** - Visual guide
- **STYLING_BEFORE_AFTER.md** - Examples

---

**Everything you need for modern, professional styling!** ✨
