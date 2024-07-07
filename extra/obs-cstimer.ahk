#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

; ! = Alt, + = Shift, ^ = Ctrl
; https://autohotkey.com/docs/Hotkeys.htm

#If WinExist("csTimer - Professional Rubik") and WinExist("ahk_exe obs64.exe")

; Switch to OBS, stop recording, switch back
f22::
	SetTitleMatchMode, 1 ; start with string

	if (WinExist("ahk_exe obs64.exe")) {
		WinActivate
		Sleep, 150
		Send !+^{r}
		Sleep, 150
	}

	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
		Sleep, 50
		MouseMove 870, 970
	}
return

; Switch to OBS, start recording, switch back
f23::
	SetTitleMatchMode, 1 ; start with string

	if (WinExist("ahk_exe obs64.exe")) {
		WinActivate
		Sleep, 150
		Send !^{r}
		Sleep, 150
	}

	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
		Sleep, 50
		MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	}
return
