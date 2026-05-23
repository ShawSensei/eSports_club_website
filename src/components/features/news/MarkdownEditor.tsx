'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({ name, defaultValue = '', placeholder, rows = 20 }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            !preview
              ? 'bg-[var(--accent-primary)] text-black'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            preview
              ? 'bg-[var(--accent-primary)] text-black'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Preview
        </button>
        <span className="ml-auto text-xs text-[var(--text-muted)]">Markdown supported</span>
      </div>

      {preview ? (
        <div
          className="prose prose-invert max-w-none p-4 text-sm"
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[var(--text-muted)]">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          name={name}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y bg-[var(--bg-card)] px-4 py-3 font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
        />
      )}
    </div>
  )
}
