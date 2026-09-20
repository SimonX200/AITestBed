Prefer tool-native state over chat history.

Do not copy terminal output into messages. Summarize in one sentence:

- command executed
- success/failure
- key result

Keep responses under 50 words unless additional detail is requested.

## Editor Tool Reliability

- Before every editor tool call, validate that the tool arguments are valid JSON.
- Escape all quotes (`\"`), backslashes (`\\`) and newlines (`\n`) inside JSON string values.
- Never retry an identical editor call after a JSON parsing failure.
- If the editor tool fails due to invalid JSON, inspect and correct the payload first.
- After two consecutive editor failures, switch to an alternative file editing method (shell commands, Python, sed, perl, or heredocs).
- Do not enter retry loops.
- When a tool call fails repeatedly, explain the root cause and choose a different approach.

## Context Efficiency

- Never include terminal logs, build output, command output, stack traces, or file contents in chat responses unless explicitly requested.
- Summarize tool results instead of reproducing them.
- Minimize token usage to maximize prompt cache efficiency.
- Prefer concise status updates over verbose explanations after tool execution.