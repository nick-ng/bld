MY_SESSION=$(tmux list-sessions | grep "bld")
if [[ ! $MY_SESSION ]]; then
		# create a new session and `-d`etach
		tmux new-session -d -s bld
		tmux new-window
		tmux send "./dev-server.sh"
		tmux split-window -h
		tmux send "codium . && npm start"
fi
tmux attach-session -d -t bld
