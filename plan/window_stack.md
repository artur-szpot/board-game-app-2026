in app state, preserve a stack of open windows; render the top frame only, but this helps know what to go to next (e.g. FORM (add game) opened DROPDOWN (location) which opened a FORM (add location))
when a window opens another, mark in the state what it is waiting to receive, then when another window is closed parse the return appropriately
recognize "close" payload as one not to execute callbacks on
bottom frame is always MAIN_MENU
on app start, open two frames (MAIN_MENU, LIST_GAMES) -- will become configurable in the future