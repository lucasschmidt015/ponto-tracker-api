# Timezone Implementation - São Paulo, Brazil

This document explains the timezone implementation in the ponto-tracker-api application.

## Overview

The application has been configured to use São Paulo, Brazil timezone (`America/Sao_Paulo`) for all date and time operations. This ensures consistent time handling across the entire application, regardless of the server's local timezone.

## Libraries Used

- **moment-timezone**: For timezone-aware date and time operations
- **moment**: Core moment.js library (already installed)

## Timezone Utility Functions

All timezone-related operations are centralized in `src/common/utils/timezone.util.ts`:

### Core Functions

- `getCurrentDateTime()`: Get current date and time in São Paulo timezone
- `getCurrentDate()`: Get current date (start of day) in São Paulo timezone
- `getStartOfDay(date)`: Get start of day for a given date in São Paulo timezone
- `getEndOfDay(date)`: Get end of day for a given date in São Paulo timezone
- `formatDateString(date)`: Format date to YYYY-MM-DD string in São Paulo timezone
- `getMinuteBounds(date)`: Get start and end of minute for date validation
- `toSaoPauloTime(date)`: Convert any date to São Paulo timezone
- `isBeforeToday(date)`: Check if a date is before today in São Paulo timezone

## Updated Services

### 1. Entries Service (`src/modules/entries/entries.service.ts`)

- **Entry Time Validation**: Uses São Paulo timezone for minute-based duplicate prevention
- **Entry Registration**: Current time captured in São Paulo timezone
- **Date Queries**: Day-based entry retrieval uses São Paulo timezone boundaries

### 2. Working Days Service (`src/modules/working-days/working-days.service.ts`)

- **Working Day Creation**: Uses São Paulo date for working day records
- **Automatic Completion**: Finishes working days based on São Paulo timezone

### 3. Entries Controller (`src/modules/entries/entries.controller.ts`)

- **Date Parameters**: Converts date query parameters to São Paulo timezone

### 4. Entries Approval Service (`src/modules/entries_approval/entries_approval.service.ts`)

- **Approval Timestamps**: Records approval dates in São Paulo timezone

### 5. Auth Service (`src/modules/auth/auth.service.ts`)

- **Token Expiration**: Validates token expiration against São Paulo time

### 6. Auth Guard (`src/modules/auth/auth.guard.ts`)

- **Token Validation**: Checks token expiration in São Paulo timezone

## Benefits

1. **Consistency**: All timestamps are in the same timezone regardless of server location
2. **User Experience**: Times displayed match the local business timezone
3. **Data Integrity**: Date-based queries work correctly for Brazilian business hours
4. **Maintainability**: Centralized timezone logic makes updates easy

## Important Notes

- São Paulo timezone observes Daylight Saving Time, handled automatically by moment-timezone
- Current offset is UTC-3 (may change to UTC-2 during DST)
- All database timestamps are still stored in UTC but processed in São Paulo timezone
- The application gracefully handles timezone transitions

## Usage Examples

```typescript
import {
  getCurrentDateTime,
  formatDateString,
} from '../../common/utils/timezone.util';

// Get current time in São Paulo
const now = getCurrentDateTime();

// Format a date for São Paulo timezone
const dateString = formatDateString(new Date());

// Get today's date boundaries
const startOfDay = getStartOfDay(new Date());
const endOfDay = getEndOfDay(new Date());
```
