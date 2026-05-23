'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function PostBody({ body }: { body: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.875rem', fontWeight: 900, marginBottom: '1rem', marginTop: '2rem' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', marginTop: '2rem' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1.5rem' }}>{children}</h3>,
          p: ({ children }) => <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.25rem' }}>{children}</p>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>{children}</a>,
          ul: ({ children }) => <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.25rem', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.25rem', listStyleType: 'decimal' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '0.4rem', lineHeight: '1.7' }}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1rem', margin: '1.5rem 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)', padding: '0.2em 0.4em', borderRadius: '4px', fontSize: '0.875em' }}>{children}</code>
            ) : (
              <pre style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', overflowX: 'auto', marginBottom: '1.25rem' }}>
                <code style={{ color: 'var(--text-primary)', fontSize: '0.875em' }}>{children}</code>
              </pre>
            ),
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => src ? (
            // Markdown images have unknown dimensions so Next/Image can't be used here
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ''} style={{ borderRadius: '12px', maxWidth: '100%', margin: '1.5rem 0' }} />
          ) : null,
          hr: () => <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</td>,
          strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}
