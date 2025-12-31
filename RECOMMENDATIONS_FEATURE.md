# Financial Recommendations System

## Overview

The Financial Recommendations system provides personalized guidance on how to allocate money across emergency fund, savings, investments, and discretionary spending based on the user's financial situation.

## Core Philosophy

Based on proven financial principles:
- **50/30/20 Rule**: 50% needs, 30% wants, 20% savings/investments
- **Emergency Fund First**: 3-6 months of expenses before investing
- **Progressive Allocation**: Recommendations adapt to financial health
- **Balanced Growth**: Build security first, then wealth

## Features

### 💯 Financial Health Score
**Range**: 0-100

**Components** (weighted):
- **Emergency Fund Health** (40 points)
  - 0-25% of target = Critical
  - 25-50% of target = Building
  - 50-100% of target = Good
  - 100%+ of target = Excellent

- **Savings Rate** (30 points)
  - Target: 20%+ of income
  - Includes emergency fund + savings + investments

- **Expense Ratio** (30 points)
  - Needs should be ≤50% of income
  - Under 50% = 30 points
  - 50-60% = 20 points
  - Over 60% = 10 points

**Score Interpretation**:
- 80-100: Excellent 🌟
- 60-79: Good 👍
- 40-59: Fair ⚠️
- 0-39: Needs Improvement 🚨

### 🚨 Emergency Fund Recommendations

**Priority Levels**:

**High Priority (Critical State)**:
- Current fund <25% of target
- Allocate 35% of surplus
- Reasoning: "Critically low, urgent priority"
- Advice: Build to 3 months minimum ASAP

**High Priority (Building State)**:
- Current fund 25-50% of target
- Allocate 25% of surplus
- Reasoning: "Making progress, keep going"
- Advice: Continue building to 6 months

**Medium Priority (Good State)**:
- Current fund 50-100% of target
- Allocate 15% of surplus
- Reasoning: "Almost there, top it up"
- Advice: Complete the 6-month target

**Low Priority (Excellent State)**:
- Current fund ≥100% of target
- Allocate 0% (fully funded)
- Reasoning: "Fully funded, focus elsewhere"
- Advice: Shift focus to growth

**Calculation**:
```typescript
Target = Monthly "needs" expenses × 6
Gap = Target - Current amount
Recommended = Min(Calculated%, Gap)
```

### 💰 Savings Recommendations

**Short-term savings** for goals and opportunities.

**Allocation**:
- If emergency fund excellent: 40% of remaining surplus
- Otherwise: 30% of remaining surplus

**Reasoning**:
- Emergency fund excellent: "Focus on building opportunities"
- Otherwise: "Build savings while maintaining emergency fund"

**Use Cases**:
- Short-term goals (1-3 years)
- Opportunity fund
- Large purchases
- Life events

### 📈 Investment Recommendations

**Long-term wealth building**.

**Allocation Based on Emergency Fund**:

**Critical/Building** (<50% of target):
- Recommended: ₱0
- Reasoning: "Focus on emergency fund first"
- Advice: Don't invest until secured

**Good** (50-100% of target):
- Recommended: 50% of remaining surplus
- Reasoning: "Start building wealth"
- Advice: Begin with index funds

**Excellent** (≥100% of target):
- Recommended: 70% of remaining surplus
- Reasoning: "Maximize long-term growth"
- Advice: Consistent investing

**Investment Suggestions**:
- Index funds (PSEi index)
- Mutual funds
- UITF (Unit Investment Trust Funds)
- COL Financial, Philstocks
- Retirement accounts (MP2, PERA)

### 🎉 Discretionary Spending

**What's left after all allocations**.

**Calculation**:
```
Discretionary = Surplus - Emergency - Savings - Investments
```

**Purpose**:
- Guilt-free spending money
- Wants and lifestyle
- Entertainment, dining, hobbies
- Quality of life

**Philosophy**: Financial health doesn't mean deprivation. This amount is yours to enjoy!

## Key Advice System

Dynamic advice based on financial analysis:

### Emergency Fund Advice
- 🚨 "Build emergency fund urgently" (Critical)
- 💪 "Keep building emergency fund" (Building)
- ✅ "Emergency fund is solid" (Excellent)

### Spending Advice
- ⚠️ "Needs exceed 50% of income - reduce"
- 💰 "Consider reducing wants spending"
- 🚨 "URGENT: Expenses exceed income"

### Savings Advice
- 🏆 "Excellent! Saving 20%+ of income"
- ⏳ "Hold off investing until emergency fund built"
- 🌱 "Ready to start investing"
- 📈 "Maximize investment growth"

## How It Works

### 1. Data Collection
```typescript
- Current balance
- Monthly income
- All expenses (needs vs wants)
- Emergency fund goal
- Current emergency fund amount
- Safe-to-spend from forecast
```

### 2. Analysis
```typescript
- Calculate monthly surplus
- Assess emergency fund health
- Evaluate expense ratios
- Check savings rate
```

### 3. Allocation Logic
```typescript
Priority 1: Emergency Fund (if needed)
  ↓
Priority 2: Savings (30-40% of remaining)
  ↓
Priority 3: Investments (50-70% of remaining)
  ↓
Priority 4: Discretionary (what's left)
```

### 4. Health Score Calculation
```typescript
Score = Emergency Fund Health (40pts)
      + Savings Rate (30pts)
      + Expense Ratio (30pts)
```

### 5. Advice Generation
```typescript
- Analyze each component
- Generate contextual advice
- Prioritize recommendations
- Provide actionable steps
```

## User Interface

### Health Score Card
```
┌────────────────────────────────────┐
│ Your Financial Health Score        │
│                                    │
│    🌟    85                        │
│         Excellent                  │
│                                    │
│ ████████████████████░░ 85%        │
└────────────────────────────────────┘
```

### Key Advice
```
┌────────────────────────────────────┐
│ 💡 Key Recommendations             │
│                                    │
│ • ✅ Emergency fund is solid       │
│ • 🏆 Excellent! Saving 20%+       │
│ • 📈 Maximize investment growth    │
└────────────────────────────────────┘
```

### Allocation Breakdown
```
┌────────────────────────────────────┐
│ Recommended Monthly Allocation     │
│ Based on monthly income: ₱30,000   │
│                                    │
│ 🚨 Emergency Fund     ₱2,000      │
│    Medium Priority                 │
│    Almost there! Top it up...      │
│                                    │
│ 💰 Savings            ₱2,400      │
│    8.0% of income                 │
│    Build savings for goals...      │
│                                    │
│ 📈 Investments        ₱3,600      │
│    12.0% of income                │
│    Maximize long-term growth...    │
│                                    │
│ 🎉 Discretionary      ₱2,000      │
│    Enjoy responsibly!              │
│                                    │
│ Total: ₱10,000                    │
└────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: New User (No Emergency Fund)

**Profile**:
- Income: ₱30,000/month
- Expenses: ₱20,000 (₱15k needs, ₱5k wants)
- Surplus: ₱10,000
- Emergency fund: ₱0 / ₱90,000 target

**Recommendations**:
- Emergency Fund: ₱3,500 (35% - HIGH PRIORITY)
- Savings: ₱1,950 (30% of remaining)
- Investments: ₱0 (don't invest yet)
- Discretionary: ₱4,550

**Health Score**: 35 (Needs Improvement)

**Key Advice**:
- 🚨 Build emergency fund urgently
- ⏳ Hold off investing until emergency fund built

---

### Scenario 2: Building (Halfway to Goal)

**Profile**:
- Income: ₱30,000/month
- Expenses: ₱20,000
- Surplus: ₱10,000
- Emergency fund: ₱45,000 / ₱90,000 target

**Recommendations**:
- Emergency Fund: ₱2,500 (25% - HIGH PRIORITY)
- Savings: ₱2,250 (30% of remaining)
- Investments: ₱0 (not yet)
- Discretionary: ₱5,250

**Health Score**: 55 (Fair)

**Key Advice**:
- 💪 Keep building emergency fund - halfway there

---

### Scenario 3: Strong Foundation

**Profile**:
- Income: ₱30,000/month
- Expenses: ₱20,000
- Surplus: ₱10,000
- Emergency fund: ₱90,000 / ₱90,000 target ✅

**Recommendations**:
- Emergency Fund: ₱0 (fully funded!)
- Savings: ₱4,000 (40% of surplus)
- Investments: ₱4,200 (70% of remaining)
- Discretionary: ₱1,800

**Health Score**: 85 (Excellent)

**Key Advice**:
- ✅ Emergency fund is solid
- 📈 Great position to maximize investments
- 🏆 Excellent! Saving 20%+ of income

## Access Points

### From Dashboard
1. Click **"💡 Get Recommendations"** button (featured prominently)
2. Opens recommendations page

### Direct URL
Navigate to: `/recommendations`

## Best Practices for Users

### Review Regularly
- Check monthly after income/expense changes
- Review before major financial decisions
- Adjust as life circumstances change

### Follow Priority Order
1. Emergency fund first (3-6 months)
2. Then savings (short-term goals)
3. Then investments (long-term growth)
4. Enjoy discretionary guilt-free

### Implementation Steps
1. Set up automatic transfers on payday
2. Open investment accounts (COL, etc.)
3. Start small, increase gradually
4. Track progress through goals page

### When to Deviate
- Major life events (wedding, house)
- Medical emergencies
- Career transitions
- Debt payoff (add this priority)

## Technical Implementation

### Files
- **`lib/recommendations.ts`** - Core recommendation engine (400+ lines)
- **`app/recommendations/page.tsx`** - UI page (320+ lines)

### Key Functions

**`generateRecommendations(input)`**:
- Takes: balance, income, expenses, goals
- Returns: Full recommendation object
- Logic: Emergency → Savings → Investments → Discretionary

**`calculate50_30_20(income)`**:
- Implements 50/30/20 rule
- Used as reference benchmark

**`calculateEmergencyFundTarget(expenses)`**:
- Sums "needs" expenses × 6
- Returns target amount

**`getEmergencyFundHealth(current, target)`**:
- Returns: critical | building | good | excellent
- Based on percentage of target achieved

**`getHealthScoreLabel(score)`**:
- Converts score to label + emoji
- Returns: color, label, emoji

### Algorithm Flow
```typescript
1. Gather user data
2. Calculate monthly surplus
3. Assess emergency fund status
4. Determine priority allocations
5. Calculate recommended amounts
6. Generate health score
7. Create contextual advice
8. Return full recommendation
```

## Future Enhancements

Potential V2 features:
- [ ] Debt payoff integration
- [ ] Custom allocation targets
- [ ] Historical tracking
- [ ] Progress over time charts
- [ ] Scenario comparisons
- [ ] Investment portfolio suggestions
- [ ] Tax optimization advice
- [ ] Retirement planning calculator

## Educational Value

Users learn:
- ✅ Emergency fund importance
- ✅ Priority order for money
- ✅ Balanced financial planning
- ✅ 50/30/20 rule principles
- ✅ When to start investing
- ✅ Realistic allocation targets
- ✅ Health score interpretation

## Success Metrics

Track user behavior:
- Recommendations viewed per user
- Emergency fund goal completion rate
- Average health score over time
- Investment account openings
- Goal achievement rates

---

**Status:** ✅ Complete and Production Ready

The recommendation system provides actionable, personalized financial guidance that helps users make smart allocation decisions and build long-term wealth!

