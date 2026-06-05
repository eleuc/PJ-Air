#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get the root directory (parent of scripts/)
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to root directory
cd "$ROOT_DIR"

# Create or attach to tmux session
SESSION_NAME="dev"

# Check if session exists, if not create it
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    # Create new session
    tmux new-session -d -s "$SESSION_NAME"

    # Split window vertically
    tmux split-window -h -t "$SESSION_NAME"

    # Run frontend in first pane
    tmux send-keys -t "$SESSION_NAME":0.0 "npm run dev -w frontend" C-m

    # Run backend in second pane
    tmux send-keys -t "$SESSION_NAME":0.1 "npm run start:dev -w backend" C-m
fi

# Attach to the session
tmux attach-session -t "$SESSION_NAME"
