#!/bin/bash

session=selvrapportering-svc

tmux new -s $session -d

tmux split-window -h -t $session
tmux resize-pane -t $session -x 5

tmux split-window -v -t $session
tmux send-keys -t $session 'npm start' C-m

tmux split-window -v -t $session
tmux send-keys -t $session 'npm run dev-server' C-m

tmux select-pane -L -t $session
tmux send-keys -t $session 'code .' C-m

tmux attach -t $session
