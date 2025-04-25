export const TOOL_DESCRIPTIONS = {
    COPY_FILE: {
        TOOL: `Copies a file from one location to another.
            
            Key features:
            - Preserves file content and metadata
            - Optional overwrite protection
            - Returns error if source doesn't exist
            - Creates destination directory if needed
            
            Common usage patterns:
            - Backup files before modification
            - Duplicate templates/configs
            - Move files between directories`,
        PARAMS: {
            SOURCE_PATH: `Path to the source file to be copied.
                Must be a valid, existing file path.
                Can be absolute or relative path.`,
            DEST_PATH: `Destination path where the file should be copied.
                Can be an existing or new directory.
                Parent directories will be created if needed.
                Fails if destination exists and overwrite=false.`,
            OVERWRITE: `Controls behavior when destination file exists:
                - false (default): Fail with error if file exists
                - true: Replace existing file with source file`
        }
    },
    CREATE_FILE: {
        TOOL: `Creates a new file at the specified path with optional initial content.
            
            Key features:
            - Creates parent directories automatically if needed
            - Supports empty files or files with content
            - Returns error if file already exists
            - UTF-8 encoding for content
            
            Common usage patterns:
            - Creating new source files
            - Initializing configuration files
            - Creating placeholder files
            - Generating files from templates`,
        PARAMS: {
            FILE_PATH: `Path where the new file should be created.
                Can be absolute or relative path.
                Parent directories will be created if needed.
                Must not exist (fails if file exists).`,
            CONTENT: `Optional initial content to write to the file.
                If omitted, creates an empty file.
                Content will be encoded as UTF-8.
                Common use: templates, generated code, config files.`
        }
    },
    DELETE_FILE: {
        TOOL: `Permanently removes a file from the filesystem.
            
            Key features:
            - Permanently deletes single files
            - Returns error if file doesn't exist
            - Returns error if path is a directory
            - No built-in undo/recovery
            
            Common usage patterns:
            - Cleanup of temporary files
            - Removing outdated backups
            - Deleting generated artifacts
            - File system maintenance`,
        PARAMS: {
            FILE_PATH: `Path to the file that should be deleted.
                Must be a valid, existing file path.
                Must point to a file (not a directory).
                Can be absolute or relative path.
                Operation cannot be undone after successful deletion.`
        }
    },
    FIND_IN_FILE: {
        TOOL: `Locates a string within a file and returns its byte position without loading the entire file.
            
            Key features:
            - Memory-efficient for large files
            - Returns byte position for exact matches
            - Case-sensitive search
            - Streams file content
            
            Common usage patterns:
            - Locating text for patch operations
            - Finding positions for insertions
            - Code analysis and refactoring
            - Pre-check before modifications
            
            Best practices:
            - Often used with patch_file_lines or get_file_slice
            - Use unique search strings when possible
            - Consider string length in byte calculations`,
        PARAMS: {
            FILE_PATH: `Path to the file to search within.
                Must be a valid, existing file path.
                Can be absolute or relative path.
                File should be readable.`,
            SEARCH_STRING: `Text to locate within the file.
                Case-sensitive exact match required.
                Returns position of first occurrence.
                Consider using unique substrings for precise location.
                Returns error if string not found.`
        }
    },
    GET_FILE_INFO: {
        TOOL: `Retrieves metadata about a file without reading its contents.
            
            Key features:
            - Efficient metadata access
            - No content loading
            - Returns file system attributes
            - Works for any file type
            
            Common usage patterns:
            - Check file existence
            - Get file size before operations
            - Verify file permissions
            - Check last modification time
            - Determine file type (file/directory/symlink)`,
        PARAMS: {
            FILE_PATH: `Path to the file to inspect.
                Can be absolute or relative path.
                Works with any file type.
                Returns error if path doesn't exist.
                Returns standardized file system attributes:
                - size: file size in bytes
                - isFile: boolean
                - isDirectory: boolean
                - isSymlink: boolean
                - created: creation timestamp
                - modified: last modification timestamp
                - accessed: last access timestamp`
        }
    },
    GET_FILE_SLICE: {
        TOOL: `Extracts a specific portion of a file's content by byte position with optional context lines.
            
            Key features:
            - Memory-efficient partial reads
            - Optional context lines
            - UTF-8 text handling
            - Byte-precise extraction
            
            Common usage patterns:
            - Reading specific sections
            - Previewing changes
            - Examining content around found matches
            - Analyzing file portions
            
            Best practices:
            - Often used with find_in_file to locate positions
            - Consider UTF-8 encoding when calculating positions
            - Add context lines for better readability`,
        PARAMS: {
            FILE_PATH: `Path to the file to read from.
                Must be a valid, existing file path.
                Can be absolute or relative path.
                File should be readable.`,
            START_POSITION: `Byte position where to begin reading.
                0-based position in the file.
                Must be within file bounds.
                Often obtained from find_in_file.`,
            LENGTH: `Number of bytes to read from start position.
                Must be positive number.
                Reading will stop at end of file if length exceeds it.`,
            CONTEXT_LINES: `Optional number of lines to include before/after the slice.
                Default is 2 lines.
                Useful for understanding surrounding content.
                Set to 0 to disable context.`
        }
    },
    LIST_DIRECTORY: {
        TOOL: `Lists the contents of a directory, providing metadata for each entry.
            
            Key features:
            - Lists files and subdirectories
            - Provides entry metadata
            - No recursive listing
            - Includes hidden files
            
            Common usage patterns:
            - File system navigation
            - Directory content inspection
            - Finding specific file types
            - Batch operation preparation
            
            Best practices:
            - Use with get_file_info for detailed entry info
            - Check entry types before operations
            - Handle hidden files appropriately`,
        PARAMS: {
            DIR_PATH: `Path to the directory to list.
                Must be a valid, existing directory path.
                Can be absolute or relative path.
                Returns array of entries with properties:
                - name: entry name
                - isFile: boolean
                - isDirectory: boolean
                - isSymlink: boolean`
        }
    },
    PATCH_FILE_LINES: {
        TOOL: `Modifies a specific range of lines in a file with preview capability.
            
            Key features:
            - Line-based modification
            - Preview mode with unified diff format
            - Contextual preview with surrounding lines
            - Zero-based line numbering
            
            Common usage patterns:
            - Updating configuration files
            - Code modifications
            - Text file edits
            - Content replacement
            
            Best practices:
            - Use preview_only=true first to verify changes
            - Consider line endings in replacement text
            - Verify line numbers before patching
            - Use find_in_file to locate target lines`,
        PARAMS: {
            FILE_PATH: `Path to the file to modify.
                Must be a valid, existing file path.
                Can be absolute or relative path.
                File must be writable.`,
            START_LINE: `Zero-based line number where modification begins.
                Must be within file bounds.
                Must be less than or equal to end_line.`,
            END_LINE: `Zero-based line number where modification ends (inclusive).
                Must be within file bounds.
                Must be greater than or equal to start_line.`,
            REPLACEMENT: `New content to replace the specified line range.
                Can be empty string to delete lines.
                Should include necessary line endings.
                UTF-8 encoded text.`,
            PREVIEW_ONLY: `When true, returns unified diff preview without modifying file.
                Default is false.
                Preview includes @@ headers and context lines.
                Useful for verifying changes before applying.`,
            CONTEXT_LINES: `Number of unchanged lines to show around modifications in preview.
                Default is 2 lines before and after.
                Only affects preview output.
                Set to 0 to show only changed lines.`
        }
    },
    PATCH_FILE_POSITIONS: {
        TOOL: `Modifies a file by replacing content at specific character positions.
            
            Key features:
            - Character-based precision
            - Byte position awareness
            - Preview mode with context
            - UTF-8 text handling
            
            Common usage patterns:
            - Precise text insertions
            - Working with byte positions
            - Character-level edits
            - Token replacements
            
            Best practices:
            - Use find_in_file to locate positions
            - Consider UTF-8 encoding implications
            - Preview changes before applying
            - Account for zero-based positions`,
        PARAMS: {
            FILE_PATH: `Path to the file to modify.
                Must be a valid, existing file path.
                Can be absolute or relative path.
                File must be writable.`,
            START_POS: `Starting character position for modification.
                Zero-based position in the file.
                Must be within file bounds.
                Consider UTF-8 encoding for non-ASCII text.`,
            END_POS: `Ending character position for modification (inclusive).
                Zero-based position in the file.
                Must be greater than or equal to start_pos.
                Consider UTF-8 encoding for non-ASCII text.`,
            REPLACEMENT: `New content to replace the specified range.
                Can be empty string to delete content.
                Will be encoded as UTF-8.
                Length can differ from replaced content.`,
            PREVIEW_ONLY: `When true, returns preview without modifying file.
                Default is false.
                Preview includes surrounding context.
                Useful for verifying character positions.`,
            CONTEXT_CHARS: `Number of characters to show around modification in preview.
                Default is 20 characters before and after.
                Only affects preview output.
                Helps verify correct positioning.`
        }
    },
    PING: {
        TOOL: `A simple diagnostic tool that returns 'pong'.
            
            Key features:
            - Zero configuration
            - No parameters needed
            - Immediate response
            - Useful for testing
            
            Common usage patterns:
            - Connection testing
            - Tool chain verification
            - Latency checks
            - System health checks`,
        PARAMS: {}
    },
    READ_FILE: {
        TOOL: `Reads and returns the entire content of a file.
            
            Key features:
            - Full file content access
            - UTF-8 text decoding
            - Memory-efficient streaming
            - Error handling for missing files
            
            Common usage patterns:
            - Reading configuration files
            - Loading text content
            - File content analysis
            - Data processing preparation
            
            Best practices:
            - Check file existence first with get_file_info
            - Consider file size before reading
            - Use get_file_slice for partial reads
            - Handle potential encoding issues`,
        PARAMS: {
            FILE_PATH: `Path to the file to read.
                Must be a valid, existing file path.
                Can be absolute or relative path.
                File must be readable.
                Returns error if file doesn't exist.
                Content returned as UTF-8 text.`
        }
    },
    WRITE_FILE: {
        TOOL: `Writes content to a file, replacing any existing content.
            
            Key features:
            - Complete file content replacement
            - Creates parent directories if needed
            - UTF-8 text encoding
            - Error handling for write access
            
            Common usage patterns:
            - Saving configuration files
            - Writing processed data
            - Creating log files
            - Generating output files
            
            Best practices:
            - Verify file permissions first
            - Consider using create_file for new files
            - Back up existing content if needed
            - Handle encoding requirements`,
        PARAMS: {
            FILE_PATH: `Path to the file to write.
                Can be absolute or relative path.
                Parent directories will be created if needed.
                File will be created if it doesn't exist.
                Existing content will be completely replaced.`,
            CONTENT: `Content to write to the file.
                Will be encoded as UTF-8 text.
                Can be empty string for empty file.
                No automatic line ending handling.`
        }
    }
} as const;