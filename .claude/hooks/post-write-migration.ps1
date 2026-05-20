# PostToolUse hook — fires after every Write or Edit tool call.
# If the written file is a Supabase migration, reminds Claude to regenerate TS types.
try {
    $raw = $input | Out-String
    $d = $raw | ConvertFrom-Json -ErrorAction Stop
    $fp = $d.tool_input.file_path
    if ($fp -and $fp -match 'supabase[/\\]migrations') {
        Write-Host ""
        Write-Host "HOOK REMINDER: Migration file written. Regenerate TypeScript types before continuing:"
        Write-Host "  supabase gen types typescript --local > src/types/supabase.ts"
        Write-Host ""
    }
} catch {
    # Silently ignore parse errors (non-JSON stdin, etc.)
}
