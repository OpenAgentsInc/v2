# Pane Refactor Log

This document logs the actions taken to refactor the components in the `components/hud/` directory and remove the concept of "Hud".

## Files Moved and Renamed:

1. `components/hud/UserStatus.tsx` -> `panes/user/UserStatus.tsx`
2. `components/hud/balance.tsx` -> `panes/user/Balance.tsx`
3. `components/hud/hud.tsx` -> `panes/PaneManager.tsx`
4. `components/hud/index.ts` -> `panes/index.ts`
5. `components/hud/pane.tsx` -> `panes/Pane.tsx`

## Actions Taken:

1. Moved `components/hud/UserStatus.tsx` to `panes/user/UserStatus.tsx`
   - Updated import statements:
     - Changed `import { Balance } from '@/components/hud/balance'` to `import { Balance } from '@/panes/user/Balance'`
     - Changed `import { Pane } from '@/components/hud/pane'` to `import { Pane } from '@/panes/Pane'`

2. Moved `components/hud/balance.tsx` to `panes/user/Balance.tsx`
   - No changes to import statements were necessary for this file

3. Moved and renamed `components/hud/hud.tsx` to `panes/PaneManager.tsx`
   - Updated component name from `Hud` to `PaneManager`
   - Updated import statements:
     - Changed `import { useHudStore } from '@/store/hud'` to `import { usePaneStore } from '@/store/pane'`
     - Changed `import { Pane as PaneComponent } from '@/components/hud/pane'` to `import { Pane as PaneComponent } from '@/panes/Pane'`
     - Changed `import { UserStatus } from './UserStatus'` to `import { UserStatus } from '@/panes/user/UserStatus'`
   - Removed the outer `<div>` wrapper

4. Updated `panes/index.ts`
   - Changed `export * from './Hud'` to `export * from './PaneManager'`

5. Moved `components/hud/pane.tsx` to `panes/Pane.tsx`
   - No changes to import statements were necessary for this file

6. Refactored `components/home/HomeAuthed.tsx`
   - Updated import statements:
     - Changed `import { Pane } from '@/components/hud/pane'` to `import { Pane } from '@/panes/Pane'`
     - Changed `import { Hud } from '../hud/hud'` to `import { PaneManager } from '@/panes/PaneManager'`
     - Added `import { usePaneStore } from '@/store/pane'`
   - Replaced static `Pane` component with dynamic pane creation using `usePaneStore`
   - Replaced `<Hud />` with `<PaneManager />`

## Next Steps:

1. Update any remaining import statements in other files that may still be referencing the old `components/hud/` path or `Hud` component
2. Rename `useHudStore` to `usePaneStore` in the store file and update all references
3. Remove the now-empty `components/hud/` directory
4. Test the application thoroughly to ensure all functionality related to these components is working as expected
5. Update any documentation or comments that may reference the old file structure or "Hud" concept