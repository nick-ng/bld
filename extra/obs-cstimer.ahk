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

	CoordMode, Mouse, Window
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2, 1

	if (WinExist("ahk_exe obs64.exe")) {
		WinActivate
		Sleep, 150
		Send !+^{r}

		loop {
			CoordMode, Pixel, Window
			PixelGetColor, RecordButtonColor, 1873, 795

			if (RecordButtonColor = 0x4D403C) {
				break
			}

			Sleep, 150
		}
	}

	return
}

StartRecording() {
	CoordMode, Mouse, Window
	; move mouse to the middle so the big scramble isn't visible
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2, 1

	SetTitleMatchMode, 1 ; start with string

	if (WinExist("ahk_exe obs64.exe") and WinExist("csTimer - Professional Rubik")) {
		Sleep, 150
		Send !^{r}
		Sleep, 150

	}

	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
	}

	if (WinExist("Blindfolded Cube Resources - Big Scramble")) {
		WinActivate
	}

	return
}

f22::
	StopRecording()
return

; Switch to OBS, start recording, switch back
f23::
	StartRecording()
return

; apply OK and stop recording
^1::
	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
		Sleep, 100
		Send ^{1}
	}

	CoordMode, Mouse, Window
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the OK is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return

; apply +2 and stop recording
^2::
	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
		Sleep, 100
		Send ^{2}
	}

	CoordMode, Mouse, Window
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the +2 is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return


; apply DNF and stop recording
^3::
	if (WinExist("csTimer - Professional Rubik")) {
		WinActivate
		Sleep, 100
		Send ^{3}
	}

	CoordMode, Mouse, Window
	MouseMove A_ScreenWidth / 2, A_ScreenHeight / 2
	; sleep a bit so the DNF is in the recording
	Sleep, 3000

	StopRecording()
	StartRecording()
return
