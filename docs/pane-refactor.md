# Pane Refactor Log

This document logs the actions taken to refactor the components in the `components/hud/` directory.

## Files Moved:

1. `components/hud/UserStatus.tsx` -> `panes/user/UserStatus.tsx`
2. `components/hud/balance.tsx` -> `panes/user/Balance.tsx`
3. `components/hud/hud.tsx` -> `panes/Hud.tsx`
4. `components/hud/index.ts` -> `panes/index.ts`
5. `components/hud/pane.tsx` -> `panes/Pane.tsx`

## Actions Taken:

1. Moved `components/hud/UserStatus.tsx` to `panes/user/UserStatus.tsx`
   - Updated import statements:
     - Changed `import { Balance } from '@/components/hud/balance'` to `import { Balance } from '@/panes/user/Balance'`
     - Changed `import { Pane } from '@/components/hud/pane'` to `import { Pane } from '@/panes/Pane'`

2. Moved `components/hud/balance.tsx` to `panes/user/Balance.tsx`
   - No changes to import statements were necessary for this file

3. Moved `components/hud/hud.tsx` to `panes/Hud.tsx`
   - Updated import statements:
     - Changed `import { Pane as PaneComponent } from '@/components/hud/pane'` to `import { Pane as PaneComponent } from '@/panes/Pane'`
     - Changed `import { UserStatus } from './UserStatus'` to `import { UserStatus } from '@/panes/user/UserStatus'`