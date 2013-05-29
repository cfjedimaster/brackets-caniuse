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

Note - the display of individual features needs work. It is too tall vertically 
and will require you to scroll. I think that's bad, and that's where you can help.
If you have any bright ideas for how to layout this data better, please fork the code
and let me know. If you aren't familiar with Git and want to see even just some basic
ideas, that would rock. Edit as of 10/2 - I think it is a bit better, but comments
are still welcome.

History
=======
5/29/2013: Merged in a huge amount of kick ass UI updates by EvilOatmeal: https://github.com/cfjedimaster/brackets-caniuse/pull/3

Also added package.json

4/16/2013: add menu fix

12/23/2012: Small tweak due to a change to in file error handling. See: https://github.com/adobe/brackets/pull/2318  

11/12/2012: Use correct DOM insertion.  
10/24/2012: Randy Edmunds added some very nice layout updates. I fixed a floating point # and the broken filter.  
10/2/2012: Modified feature layout and removed some console.logs  
10/1/2012: Initial release  