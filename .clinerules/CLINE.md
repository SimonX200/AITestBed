# Cline Agent Requirements

## GENERAL EXECUTION & CONTEXT EFFICIENCY
- Prefer tool-native state over chat history. 
- Keep responses under 50 words unless explicitly requested.
- Never include terminal logs, build output, stack traces, or file contents in messages.
- Summarize execution in one sentence: [Command executed] | [Success/Failure] | [Key result].
- Minimize token usage to maximize prompt cache efficiency.

## TOOL IMPLEMENTATION & PAYLOAD SANITIZATION
- Before calling editor tools, validate that arguments are valid JSON.
- Escape all quotes (`\"`), backslashes (`\\`), and newlines (`\n`) inside JSON string values.
- Never retry an identical editor call after a JSON parse failure; inspect and fix the payload first.
- After two consecutive editor failures, do not enter retry loops. Switch to alternative methods (shell, sed, perl, or heredocs) immediately.

## PROMPT CEILING PROTECTION & OUTPUT CHUNKING
- NO RAW CODE IN CHAT: Never output code blocks (```ts) in messages. Every change must trigger a valid tool call.
- REASONING LIMITS: Keep `<think>` loops under 3 sentences. Abstract logic only. Never write draft code, variables, or functions inside `<think>` tags. Close with `</think>` before any tool call.
- HARD DIFF CEILING (90 LINES): When editing existing code via `<apply_diff>` or `<edit_file>`, you are strictly FORBIDDEN from generating a single diff payload larger than 90 lines. If modifications require more than 90 lines of diff blocks, you must aggressively break the refactoring into multiple, consecutive, micro-diff tool operations.
- 8K CHUNKING BYPASS: If a file or test layout will exceed 150 lines, split it across turns before typing visible code:
  * Turn 1: Open `<write_to_file>` immediately. Output ONLY skeletal structures, interfaces, and method signatures. Close tool and ask: "Part 1 mapped. Confirm to implement details."
  * Turn 2 (Upon confirmation): Inject execution logic and body content using focused `<apply_diff>` or `<edit_file>` loops.

## INFRASTRUCTURE DEBUGS & LOG MITIGATION
- LOG INGESTION BAN: Never use `read_file` or `view_outline` on files ending in `.log` or `.txt` traces.
- SHELL PRE-FILTERING: To debug failures, use terminal commands externally (`tail -n 100`, `grep -i -E "error|failed|fatal"`, or `sed/awk`) to filter logs.
- Feed a maximum of 50 extracted error lines into the chat timeline. Never pollute the context pool.

## MARKDOWN DISCIPLINE & LOOP PREVENTION
- NO DIFFS FOR PROSE: Never use `apply_diff` or `edit_file` on `.md` (Markdown) or report files.
- FULL OVERWRITES: Always update or create `REPORT.md` using a fresh, raw `<write_to_file>` payload from scratch.
- LOOP BREAKER: If an edit fails twice, stop using editor tools. Use the terminal tool with a heredoc (`cat << 'EOF' > REPORT.md`) to write the file directly. Do not enter conversational retry loops.
