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


# ====================================================================
# STRICT TOOL-CALLING & PROMPT CACHE PROTECTION PROTOCOL
# ====================================================================
1. NO RAW CODE IN CHAT: You must NEVER output source code or configurations as plain markdown blocks (e.g., using standard ```ts blocks) inside the chat window. Every file creation or modification must trigger a formal, system-valid tool call.
2. REASONING BOUNDARIES: You must NEVER initialize an XML tool block inside the `<think>` tracks. The thinking phase must be explicitly closed with `</think>` before emitting the first character of any Cline tool action. Keep your `<think>` loops concise and limited to a maximum of 3 planning sentences.
- CRITICAL ANTI-CODE RULE: You must NEVER type out actual source code, variables, function bodies, or code draft blocks inside the `<think>` tags. The thinking block is strictly reserved for high-level abstract logic steps. Do not write drafts.
3. OUTPUT CHUNKING (8K BYPASS): To prevent client-side truncation crashes at the hard 8,192 token ceiling, you must chunk large file operations. If a file or test suite layout is projected to exceed 150 lines, split the generation turn into sequential turns:
   - Turn 1: Generate the skeletal class structures, interfaces, and core method setups via `<write_to_file>`. Terminate your turn immediately by asking: "Part 1 successfully mapped out. Please confirm to proceed with implementation details."
   - Turn 2 (Upon user confirmation): Inject remaining execution logic, edge-case unit handling, and environment scripts using focused `<apply_diff>` or `<edit_file>` loops.

# ====================================================================
# TERMINAL EXECUTION & VERBOSITY SILENCING
# ====================================================================
1. OUTPUT REDIRECTION: To safeguard our high-speed local GPU Prompt Cache from context invalidation, never dump verbose terminal runs into the timeline. Append `> .cline_output.log 2>&1` to EVERY terminal pipeline, test execution, or build command you invoke.
2. COMPACT STATUS CHECKS: Parse execution failures silently by reading the `.cline_output.log` file behind the scenes. Emit only a one-line fragment inside the chat timeline to verify deployment status (e.g., "✓ 19/19 Unit Tests Passed Successfully" or "✗ Build truncated at line 42 of sessionManager.ts").
3. OUTPUT CHUNKING (8K BYPASS): To prevent client-side truncation crashes at the hard 8,192 token ceiling, you must decide on chunking BEFORE generating any visible text or code. If a file or test suite layout is projected to exceed 150 lines, immediately execute the split architecture without any conversational filler or pre-writing:
  - Turn 1: Open the `<write_to_file>` tool instantly as your very first action. Generate ONLY the skeletal class structures, interfaces, and first 3 core method signatures. Do not write the full body yet. Close the tool tag and immediately terminate your turn by asking: "Part 1 successfully mapped out. Please confirm to proceed with implementation details."
  - Turn 2 (Upon user confirmation): Inject the remaining execution logic, edge-case unit handling, and environment scripts using focused `<apply_diff>` or `<edit_file>` loops.


# ====================================================================
# LARGE LOG FILE HANDLING & CONTEXT MITIGATION
# ====================================================================
1. LOG INGESTION BAN: You are strictly FORBIDDEN from using the `read_file` or `view_outline` tools on any file ending in `.log`, `.txt` trace streams, or verbose test reports. 
2. PRE-FILTERING VIA SHELL: If you need to inspect an execution failure or evaluate a log file, you must run an industrial shell pipeline to isolate the root cause externally:
   - Use `tail -n 100 .cline_output.log` to scan only the trailing exit frames.
   - Use `grep -i -E "error|exception|failed|fatal" .cline_output.log` to filter out baseline success markers.
   - Use `awk` or `sed` to extract specific line blocks around an error stack trace.
3. LOG SUMMARIZATION: Only feed the extracted error slice (maximum 100 lines) into the chat timeline. Never allow an entire execution log to pollute our token context pool.



