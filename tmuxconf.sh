MY_SESSION=$(tmux list-sessions | grep "bld")
if [[ ! $MY_SESSION ]]; then
		# create a new session and `-d`etach
		tmux new-session -d -s bld
		tmux send "nvim ." Enter
		tmux new-window
		tmux new-window
		tmux send "npm start"
		tmux split-window -h
		tmux send "./dev-server.sh"
		tmux attach-session -d -t bld
fi
