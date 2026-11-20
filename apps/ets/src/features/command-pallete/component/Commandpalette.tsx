import React, { useEffect, useRef } from 'react';
import { useCommandPalette } from '../hooks/useCommandPalette';
import type { SearchIndexItem, RecentSearch } from '../types/command-palette.types';

const iconMap: Record<string, string> = {
  dashboard: '⊞', employees: '👤', scheduling: '📅', payroll: '💰',
  leave: '🏖', attendance: '⏱', performance: '📊', recruitment: '🎯',
  training: '🎓', invoices: '🧾', orders: '📦', expenses: '💳',
  reports: '📈', inventory: '🗃', customers: '🤝', leads: '🔗',
  users: '👥', roles: '🔑', settings: '⚙', audit: '🔍', default: '→',
};

function resolveIcon(icon: string): string {
  const key = icon.toLowerCase().replace(/[-_\s]/g, '');
  return Object.entries(iconMap).find(([k]) => key.includes(k))?.[1] ?? iconMap.default;
}

export function CommandPalette() {
  const {
    isOpen, query, results, selectedIndex, recentSearches,
    inputRef, listRef, close, handleQueryChange, handleKeyDown,
    navigateTo, navigateToRecent, setSelectedIndex, open,
  } = useCommandPalette();

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  const showResults = query.trim().length > 0;
  const showRecents = !showResults && recentSearches.length > 0;
  const showEmpty = showResults && results.length === 0;

  return (
    <div ref={wrapperRef} style={s.wrap}>

      {/* ── Trigger: plain div acting as input wrapper, NOT a <button> ── */}
      <div style={s.searchBtn} onClick={() => { open(); inputRef.current?.focus(); }}>
        <span style={s.searchIcon}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={open}   // opens on tab-focus too
          placeholder="Search pages..."
          autoComplete="off"
          spellCheck={false}
          style={s.input}
          aria-label="Search pages"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="cmd-listbox"
        />
        {query ? (
          <button
            onMouseDown={e => {
              e.preventDefault(); // prevent blur before clear
              handleQueryChange('');
            }}
            style={s.clearBtn}
            aria-label="Clear search"
            tabIndex={-1}
          >
            ✕
          </button>
        ) : (
          <div style={s.kbdWrap}>
            <kbd style={s.kbd}>Ctrl</kbd>
            <kbd style={s.kbd}>K</kbd>
          </div>
        )}
      </div>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          id="cmd-listbox"
          role="listbox"
          ref={listRef}
          style={s.dropdown}
        >
          {/* Recent searches */}
          {showRecents && (
            <>
              <p style={s.sectionLabel}>Recent</p>
              {recentSearches.slice(0, 5).map((r: RecentSearch) => (
                <div
                  key={r.id}
                  role="option"
                  aria-selected={false}
                  style={s.item}
                  onMouseDown={e => {
                    e.preventDefault(); // keep input focused
                    navigateToRecent(r.selectedItemRoute);
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ ...s.icon, fontSize: 14 }}>↺</span>
                  <div style={s.textBlock}>
                    <span style={s.title}>{r.selectedItemTitle}</span>
                    <span style={s.route}>{r.selectedItemRoute}</span>
                  </div>
                </div>
              ))}
              <div style={s.divider} />
            </>
          )}

          {/* Search results */}
          {showResults && results.length > 0 && (
            <>
              <p style={s.sectionLabel}>Pages & Modules</p>
              {results.map((item: SearchIndexItem, idx: number) => {
                const sel = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={sel}
                    data-index={idx}   // ← used by scroll-into-view in hook
                    style={{
                      ...s.item,
                      background: sel ? 'var(--color-brand-subtle, #EEF2FF)' : 'transparent',
                    }}
                    onMouseDown={e => {
                      e.preventDefault(); // keep input focused until navigate
                      navigateTo(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span style={{
                      ...s.icon,
                      background: sel ? '#E0E7FF' : 'var(--color-bg-elevated)',
                    }}>
                      {resolveIcon(item.icon || item.title)}
                    </span>
                    <div style={s.textBlock}>
                      {item.parentTitle && (
                        <span style={s.parent}>{item.parentTitle}</span>
                      )}
                      <span style={{
                        ...s.title,
                        color: sel ? '#4F46E5' : 'var(--color-text-primary)',
                      }}>
                        {item.title}
                      </span>
                    </div>
                    <span style={s.route}>{item.route}</span>
                    {sel && <span style={s.enterHint}>↵</span>}
                  </div>
                );
              })}
            </>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div style={s.empty}>
              No results for <strong>"{query}"</strong>
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                Try different keywords or check permissions
              </p>
            </div>
          )}

          {/* Initial empty — no query, no recents */}
          {!showResults && !showRecents && (
            <div style={s.empty}>
              Start typing to search pages and modules
            </div>
          )}

          {/* Footer */}
          <div style={s.footer}>
            <span style={s.hint}>
              <kbd style={s.kbd}>↑</kbd><kbd style={s.kbd}>↓</kbd>&nbsp;navigate
            </span>
            <span style={s.hint}>
              <kbd style={s.kbd}>↵</kbd>&nbsp;open
            </span>
            <span style={s.hint}>
              <kbd style={s.kbd}>Esc</kbd>&nbsp;close
            </span>
            {results.length > 0 && (
              <span style={{ ...s.hint, marginLeft: 'auto' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'relative',
  },
  searchBtn: {
    height: 36,
    minWidth: 260,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-page)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'text',
    boxSizing: 'border-box',
    width: '100%',
  },
  searchIcon: {
    fontSize: 15,
    opacity: 0.6,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    cursor: 'text',
    minWidth: 0,
    padding: 0,
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    fontSize: 12,
    padding: '2px 4px',
    flexShrink: 0,
    lineHeight: 1,
  },
  kbdWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  kbd: {
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    padding: '1px 5px',
    fontSize: 10,
    fontWeight: 600,
    background: 'var(--color-bg-header)',
    color: 'var(--color-text-tertiary)',
    fontFamily: 'monospace',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: 320,
    width: '100%',
    background: 'var(--color-bg-header)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: 300,
    overflow: 'hidden',
    maxHeight: 420,
    overflowY: 'auto',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '10px 12px 4px',
    margin: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 12px',
    cursor: 'pointer',
    margin: '2px 4px',
    borderRadius: 6,
    transition: 'background 80ms',
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'var(--color-bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  parent: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  route: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  enterHint: {
    fontSize: 11,
    color: '#818CF8',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: 'var(--color-border)',
    margin: '4px 0',
  },
  empty: {
    padding: '20px 12px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-tertiary)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-bg-page)',
    position: 'sticky',
    bottom: 0,
  },
  hint: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
};