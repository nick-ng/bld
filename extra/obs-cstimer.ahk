#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

; Switch to OBS, toggle recording, switch back
f22::
	SetTitleMatchMode, 1 ; start with string
	if (WinActive("csTimer - Professional Rubik") && WinExist("ahk_exe obs64.exe")) {
		MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
		if (WinExist("ahk_exe obs64.exe")) {
			; just to find the window
		}
		WinActivate
		Sleep, 150
		Send !^{r}
		Sleep, 150
		if (WinExist("csTimer - Professional Rubik")) {
			; just to find the window
		}
		WinActivate
	}
return
