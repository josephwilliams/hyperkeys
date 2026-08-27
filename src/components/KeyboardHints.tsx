"use client";

export interface Hint {
  key: string;
  label: string;
}

/** Shortcut bar pinned to the bottom of a page; `children` renders as status on the right. */
export default function KeyboardHints({
  hints,
  children,
}: {
  hints: Hint[];
  children?: React.ReactNode;
}) {
  return (
    <div className="h-8 flex items-center px-12 gap-4 border-t border-edge text-[10px] select-none overflow-x-auto bg-elevated text-muted">
      {hints.map((hint) => (
        <div key={hint.key} className="flex items-center gap-1 shrink-0">
          <kbd className="px-1 py-0.5 rounded bg-panel text-subtle">
            {hint.key}
          </kbd>
          <span>{hint.label}</span>
        </div>
      ))}
      {children && (
        <div className="ml-auto flex items-center gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
}
