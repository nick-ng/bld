#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

; ! = Alt, + = Shift, ^ = Ctrl
; https://autohotkey.com/docs/Hotkeys.htm

#If WinExist("csTimer - Professional Rubik") and WinExist("ahk_exe obs64.exe")

; check if obs is running, send stop recording hotkey
StopRecording() {
	SetTitleMatchMode, 1 ; start with string

	if (WinExist("ahk_exe obs64.exe") and WinExist("csTimer - Professional Rubik")) {
		Sleep, 150
		Send !+^{r}
		Sleep, 150
	}

	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
	}

	return
}

StartRecording() {
	; move mouse to the middle so the big scramble isn't visible
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2, 1

	SetTitleMatchMode, 1 ; start with string

	if (WinExist("ahk_exe obs64.exe") and WinExist("csTimer - Professional Rubik")) {
		Sleep, 150
		Send !^{r}
		Sleep, 150
		MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2, 1
	}

	return
}

f22::
	StopRecording()
	StartRecording()
return

; Switch to OBS, start recording, switch back
f23::
	StartRecording()
return

; apply OK and stop recording
~^1::
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the OK is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return

; apply +2 and stop recording
~^2::
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the +2 is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return


; apply DNF and stop recording
~^3::
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the DNF is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return
