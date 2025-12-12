# 🏸 Badminton Scoring - Quick Reference

## 📋 BWF Official Rules (Production-Ready Implementation)

### 🟢 Rally Point System
- **Every rally wins a point** - Winner of rally scores, regardless of who served
- **Winner serves next** - Rally winner becomes next server
- **Service position auto-calculated** - Even score = RIGHT court, Odd score = LEFT court

### 🟡 Golden Point Logic (29-29)
- **20-20**: Deuce starts - must win by 2 points
- **Can extend**: 21-21, 22-22, 23-23... up to 29-29
- **29-29**: GOLDEN POINT - next rally wins (sudden death)
- **Maximum**: 30-29 (one team must reach 30)

### 🔵 Deuce Rules
```
20-20 → Play continues until 2-point lead
21-19 ✓ (Team 1 wins - 2 point lead)
21-20 ✗ (Need 2 point lead - continue)
21-21 → Deuce continues
22-20 ✓ (Team 1 wins - 2 point lead)
```

### 🟣 Best-of-3 Format
- **Game 1**: Toss winner chooses serve
- **Game 2**: Loser of Game 1 serves first
- **Game 3**: Winner of Game 2 serves first (if needed)
- **Match winner**: First to win 2 games

### 🔥 Extended Setting Examples
```
Scenario 1: Standard Win
21-15 ✓ (Game over - 21 with 2+ lead)

Scenario 2: Close Win
21-19 ✓ (Game over - 21 with 2 lead)

Scenario 3: Deuce Game
20-20 → 21-20 → 21-21 → 22-21 → 23-21 ✓

Scenario 4: Long Deuce
22-22 → 23-23 → 24-23 → 25-23 ✓

Scenario 5: Golden Point
28-28 → 29-28 → 29-29 (GOLDEN POINT) → 30-29 ✓
```

---

## 🎮 Usage Flow

### Step 1: Create Game
```
Games Screen → Create Game → Select "Badminton"
```

### Step 2: Start Scoring
```
Game List → Tap game → Edit Game → "🏸 Start Badminton Scoring"
```

### Step 3: Setup Match
```
1. Choose: Singles (1v1) or Doubles (2v2)
2. Enter team names
3. Enter player names
4. Tap "Start Match"
```

### Step 4: Choose Server
```
Modal appears: "Who Serves First?"
→ Select team based on toss result
```

### Step 5: Score Points
```
Rally ends → Tap winning team button
→ Point awarded
→ Server updated automatically
→ Service position shown (RIGHT/LEFT)
```

### Step 6: Complete Match
```
Game 1 ends at 21 (win by 2) → Alert
Game 2 starts → Continue scoring
Match ends when team wins 2 games → 🏆 Winner alert
```

---

## 🎯 Visual Indicators

### Scoreboard Features
- **Large scores** (48px) - Easy to read
- **Server indicator** (● dot) - Shows who serves
- **Service position** - RIGHT or LEFT court
- **Games won** - Counter at top (0-2)
- **Current game** - Game 1, 2, or 3

### Status Banners
- **⚡ DEUCE** - Yellow banner when 20-20+
- **🔥 GOLDEN POINT** - Red banner when 29-29

### Button Colors
- **Team 1** - Primary blue
- **Team 2** - Secondary color
- **Undo** - Gray (with confirmation)

---

## 🔧 Key Features

### Implemented
✅ Rally point system (winner scores & serves)  
✅ Deuce logic (20-20, must win by 2)  
✅ Golden Point (29-29 sudden death)  
✅ Extended setting (up to 30-29)  
✅ Best-of-3 games structure  
✅ Auto service position calculation  
✅ Singles & Doubles support  
✅ Undo last point (with confirmation)  
✅ Match history tracking  
✅ Vibration feedback  
✅ Data persistence (AsyncStorage)  

### Match Data Saved
- Game-by-game scores
- Point history with timestamps
- Service tracking
- Match outcome
- Player/team info

---

## 📱 Screen Components

### BadmintonMatchSetupScreen
- Match type selector
- Team/player input forms
- Validation
- Rules info card

### BadmintonScoringScreen
- Live scoreboard
- Rally scoring buttons
- Undo functionality
- Status indicators
- Rules reference

---

## 🎲 Scoring Algorithm

```typescript
1. Rally ends → Winning team tapped
2. Award 1 point to winner
3. Check score:
   - If ≥21 with 2-point lead → Game won
   - If 29-29 → Golden Point mode
   - If 30 reached → Game won
   - Otherwise → Continue
4. Update server to rally winner
5. Calculate service position (score % 2)
6. Save to history
7. Check if match won (2 games)
```

---

## 🏆 Service Rules

### Position Rule
```typescript
serverScore % 2 === 0 ? 'RIGHT' : 'LEFT'

Examples:
Score 0 → RIGHT
Score 1 → LEFT
Score 2 → RIGHT
Score 3 → LEFT
Score 20 → RIGHT
Score 21 → LEFT
```

### Server Change
- **After every rally** - Winner becomes server
- **Between games** - See Best-of-3 rules

---

## 💾 Data Structure

```typescript
Match {
  id: string;
  gameId: string;
  matchType: 'singles' | 'doubles';
  bestOf: 3;
  team1: { name, players };
  team2: { name, players };
  games: [
    {
      team1: number;
      team2: number;
      server: 'team1' | 'team2';
      serverPosition: 'right' | 'left';
      isDeuce: boolean;
      isTiebreak: boolean;
      winner?: string;
    }
  ];
  gamesWon: { team1: 0-2, team2: 0-2 };
  pointHistory: [...];
  status: 'ongoing' | 'completed';
  winner?: string;
}
```

---

## 🔍 Testing Scenarios

### Test 1: Standard Game
```
Score to 21-15
Verify: Winner declared at 21 with 6-point lead
```

### Test 2: Deuce Game
```
Reach 20-20
Continue to 22-20
Verify: Winner declared with 2-point lead
```

### Test 3: Golden Point
```
Reach 29-29
Score next point
Verify: Winner declared at 30-29
```

### Test 4: Match Flow
```
Win Game 1: 21-18
Win Game 2: 22-20
Verify: Match complete, winner declared
```

### Test 5: Service Tracking
```
Score points, verify:
- Server changes to rally winner
- Position alternates (even=right, odd=left)
```

---

## 🚀 Integration Points

### Navigation
```typescript
RootNavigator.tsx:
- BadmintonMatchSetup route
- BadmintonScoring route

EditGameScreen.tsx:
- Entry button (conditional on sport="Badminton")
```

### Storage
```typescript
AsyncStorage key: 'badmintonMatches'
Stores: All match data with history
```

### Exports
```typescript
src/screens/index.ts:
- BadmintonScoringScreen
- BadmintonMatchSetupScreen
```

---

## ✅ Production Checklist

- [x] BWF official rules implemented
- [x] Rally point system working
- [x] Deuce logic (20-20, win by 2)
- [x] Golden Point (29-29 sudden death)
- [x] Extended setting (up to 30-29)
- [x] Best-of-3 structure
- [x] Service rules (position + rotation)
- [x] Singles & Doubles support
- [x] Data persistence
- [x] Undo functionality
- [x] Visual feedback (vibration)
- [x] Error handling
- [x] TypeScript types
- [x] No compilation errors
- [x] Integrated with app navigation

**Status: ✅ PRODUCTION READY**

---

## 📞 Support

For issues or questions about the badminton scoring system:
1. Check the complete documentation: `BADMINTON_SCORING_COMPLETE.md`
2. Review the code: `BadmintonScoringScreen.tsx`
3. Test with various score scenarios

**Last Updated**: December 11, 2025  
**Version**: 1.0 (Production-Ready)
