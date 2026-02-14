# DELIBERATION INPUT ENHANCEMENT — Voice & File Input
# ====================================================
# Claude Code Directive for sutra.team
#
# Adds two input methods to the deliberation page:
#   1. Voice input (browser Speech Recognition API)
#   2. File input (read text/PDF/docx, paste into query)
#
# No backend changes. Both just populate the textarea.
# ====================================================


# ============================================================================
# PART 1: VOICE INPUT (Browser Speech Recognition)
# ============================================================================

## What it does
# Adds a microphone button next to the Submit button.
# Click to start recording → browser transcribes speech → text fills textarea.
# Click again (or stop talking) to end. No API calls, no backend, free.

## Implementation

# Add to src/app/council/deliberate/page.tsx:

# 1. Add state variables:
```tsx
const [isListening, setIsListening] = useState(false)
const [speechSupported, setSpeechSupported] = useState(false)
const recognitionRef = useRef<any>(null)
```

# 2. Add useEffect to check support and set up recognition:
```tsx
useEffect(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (SpeechRecognition) {
    setSpeechSupported(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
      if (finalTranscript) {
        setQuery(prev => prev + finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }
}, [])
```

# 3. Add toggle function:
```tsx
function toggleListening() {
  if (!recognitionRef.current) return
  if (isListening) {
    recognitionRef.current.stop()
    setIsListening(false)
  } else {
    recognitionRef.current.start()
    setIsListening(true)
  }
}
```

# 4. Add microphone button next to the Submit button:
```tsx
{speechSupported && (
  <button
    onClick={toggleListening}
    type="button"
    className={`p-2 rounded-lg transition cursor-pointer ${
      isListening
        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
    }`}
    title={isListening ? 'Stop recording' : 'Voice input'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  </button>
)}
```

# Place the mic button in the button row, to the LEFT of the Submit button.
# Layout should be:
#   [voice input info text]  [mic button] [submit button]
# Or for a cleaner look:
#   Bottom left: "1 credit per deliberation" or voice status
#   Bottom right: [mic] [Submit to Council]


# ============================================================================
# PART 2: FILE INPUT (Text, PDF, Markdown, Docx)
# ============================================================================

## What it does
# Adds a paperclip/attach button OR a drop zone.
# User selects a file → client-side reads it → text content populates textarea.
# Supports: .txt, .md, .csv, .json (read as text directly)
# No PDF or docx parsing on client — too heavy. Just plain text files.
# If user wants PDF/docx support later, add server-side parsing.

## Implementation

# 1. Add file input ref and handler:
```tsx
const fileInputRef = useRef<HTMLInputElement>(null)

async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]
  if (!file) return

  // Size limit: 50KB for text files
  if (file.size > 50_000) {
    setError('File too large. Please paste the relevant section instead (max 50KB).')
    return
  }

  const allowedTypes = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'text/html',
  ]
  const allowedExtensions = ['.txt', '.md', '.csv', '.json', '.html']
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
    setError('Unsupported file type. Supported: .txt, .md, .csv, .json, .html')
    return
  }

  try {
    const text = await file.text()
    // Truncate if very long — keep first 4000 chars
    const truncated = text.length > 4000
      ? text.slice(0, 4000) + '\n\n[... truncated, ' + text.length + ' total characters]'
      : text
    setQuery(prev => prev ? prev + '\n\n--- Attached: ' + file.name + ' ---\n' + truncated : truncated)
    setError('')
  } catch (err) {
    setError('Could not read file.')
  }

  // Reset input so same file can be re-selected
  if (fileInputRef.current) fileInputRef.current.value = ''
}
```

# 2. Add hidden file input and attach button:
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept=".txt,.md,.csv,.json,.html"
  onChange={handleFileUpload}
  className="hidden"
/>

<button
  onClick={() => fileInputRef.current?.click()}
  type="button"
  disabled={loading}
  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition cursor-pointer disabled:opacity-50"
  title="Attach a text file"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
</button>
```

# Place the attach button next to the mic button.
# Layout: [attach] [mic] [Submit to Council]


# ============================================================================
# PART 3: UPDATED BUTTON ROW LAYOUT
# ============================================================================

# The bottom of the input section should look like this:

```tsx
<div className="flex justify-between items-center mt-3">
  <div className="text-xs text-zinc-600">
    {isListening ? (
      <span className="text-red-400 animate-pulse">Listening... click mic to stop</span>
    ) : credits === 0 ? (
      <a href="/pricing" className="text-violet-400 hover:text-violet-300">
        Purchase credits to continue →
      </a>
    ) : (
      '1 credit per deliberation · ~30 seconds'
    )}
  </div>
  <div className="flex items-center gap-2">
    {/* File attach */}
    <input
      ref={fileInputRef}
      type="file"
      accept=".txt,.md,.csv,.json,.html"
      onChange={handleFileUpload}
      className="hidden"
    />
    <button
      onClick={() => fileInputRef.current?.click()}
      type="button"
      disabled={loading}
      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition cursor-pointer disabled:opacity-50"
      title="Attach a text file"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
    </button>

    {/* Voice input */}
    {speechSupported && (
      <button
        onClick={toggleListening}
        type="button"
        className={`p-2 rounded-lg transition cursor-pointer ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
        }`}
        title={isListening ? 'Stop recording' : 'Voice input'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </button>
    )}

    {/* Submit */}
    <button
      onClick={handleSubmit}
      disabled={!canSubmit}
      className="bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? 'Deliberating...' : 'Submit to Council'}
    </button>
  </div>
</div>
```


# ============================================================================
# REQUIRED IMPORTS
# ============================================================================

# Add to the top of the deliberation page:
```tsx
import { useState, useEffect, useRef } from 'react'
```

# useRef is likely already imported. Just make sure all three are there.


# ============================================================================
# WHAT THIS DOES NOT INCLUDE
# ============================================================================
#
# - PDF parsing: Too heavy for client-side. Text files only.
#   If users need PDF, add a server endpoint later.
#
# - Docx parsing: Same as PDF. Text files only for now.
#
# - Voice output (TTS): Deliberation results are text only.
#   The LiveKit voice sessions handle real-time voice separately.
#
# - Drag-and-drop: Just the button for now. Add drop zone later if users want it.
#
# - Audio file upload: Not supported. Voice input is live transcription only.
#
# - Multi-file: One file at a time. Appends to existing query text.


# ============================================================================
# TESTING
# ============================================================================
#
# Voice input:
#   1. Open /council/deliberate in Chrome (best Speech Recognition support)
#   2. Click mic button → should pulse red
#   3. Speak "give me a business plan for a coffee shop"
#   4. Text should appear in textarea
#   5. Click mic again to stop
#   6. Submit to Council should work normally
#
# File input:
#   1. Create a test.txt with some text
#   2. Click paperclip button → file picker opens
#   3. Select test.txt → content appears in textarea
#   4. Submit to Council should work normally
#
# Edge cases:
#   - Voice not supported (Firefox private mode): mic button hidden, no error
#   - File too large: error message shown, textarea unchanged
#   - Wrong file type: error message shown
#   - Both used together: voice fills textarea, file appends to it
#
# Browser support for Speech Recognition:
#   - Chrome/Edge: Full support
#   - Safari: Partial support (may require HTTPS)
#   - Firefox: Not supported (mic button will be hidden)
