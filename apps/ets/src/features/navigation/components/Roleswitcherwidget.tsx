// src/features/navigation/components/RoleSwitcherWidget.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop this anywhere inside your Header/Navbar JSX.
//
// Renders nothing when canSwitch = false (single-role user).
// When visible, shows a pill button per role — clicking one switches the
// active dashboard immediately without a page reload.
//
// Usage:
//   import { RoleSwitcherWidget } from '../../features/navigation';
//   <Header>
//     ...
//     <RoleSwitcherWidget />
//   </Header>
// ─────────────────────────────────────────────────────────────────────────────

import { useRoleSwitcher } from '../hooks/useRoleSwitcher';

export const RoleSwitcherWidget = () => {
    const { activeRole, roleOptions, switchRole, canSwitch } = useRoleSwitcher();

    // Single-role users: render nothing — no flickering, no empty space
    if (!canSwitch) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#52796F] uppercase tracking-wide select-none">
                View as
            </span>

            <div className="flex gap-1.5">
                {roleOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => switchRole(value)}
                        aria-pressed={activeRole === value}
                        className={[
                            'px-4 py-1 text-xs font-semibold rounded-full border transition-all duration-150',
                            activeRole === value
                                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                                : 'bg-white text-[#1B4332] border-[#B7E4C7] hover:bg-[#F0FAF4]',
                        ].join(' ')}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};