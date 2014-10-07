CanIUse Extension
=================

Welcome to the initial release of the CanIUse Brackets extension. This extension
wraps the remote data for caniuse.com, a site that provides capability stats for 
various web features amongst the top browsers. Currently this extension shows a
subset of available browsers I think were most important, but this list could be 
changed as well.

To install, simply drag the brackets-caniuse folder to your Brackets/Edge Code 
extensions/user folder, reload your editor, and select "Show CanIUse" from the
View menu.

History
=======
10/7/2014: Addresses #13, better handling of dark theme. Also refreshed data.

6/18/2014: New data.

6/17/2014: Fixed a Windows (possibly Linux too) display issue.

5/28/2014: Added caniuse to CSS styles to not mess w/ Brackets

5/20/2014: Merged in a PR by karanjthakkar that corrects layout issues.

12/6/2013: Updates for file system changes (thanks to Peter Flynn)

7/7/2013: Even more updated by EvilOatmeal - 
Update to the latest CanIUse data. The data now includes a timestamp of when it was last updated so now we're using that to show when the data was last updated.

6/16/2013: More updates by EvilOatmeal - 
Update to the latest data.json from http://github.com/Fyrd/caniuse.
Refactor so eras are not hardcoded in browserVersionLookup.
Add credit to http://caniuse.com for the data.
Show the date of the latest data update in the UI.


6/16/2013: Another update by EvilOatmeal - uses proper bottom panel.

5/29/2013: Merged in a huge amount of kick ass UI updates by EvilOatmeal: https://github.com/cfjedimaster/brackets-caniuse/pull/3

Also added package.json

4/16/2013: add menu fix

12/23/2012: Small tweak due to a change to in file error handling. See: https://github.com/adobe/brackets/pull/2318  

11/12/2012: Use correct DOM insertion.  
10/24/2012: Randy Edmunds added some very nice layout updates. I fixed a floating point # and the broken filter.  
10/2/2012: Modified feature layout and removed some console.logs  
10/1/2012: Initial release  
