diasporaAutoUpdate
==================

Greasemonkey-Addon to automatically update the stream like Twitter does in it's Webinterface.

Install:  
Install Greasemonkey and [click here](https://github.com/Faldrian/diasporaAutoUpdate/raw/master/src/Diaspora_AutoUpdater_\(Wai-Modus\).user.js).

Changelog
---------

09.09.2016  
**1.4.0**

* Bugfix: Fix pod-detection for diaspora\* 0.6.0.0.
* Refactoring: Don't inject a script-element, fixes Content Security Policy compatibility.

23.04.2016  
**1.3.0**

* Design: Made use of the stream\_element class, better fit to new diaspora design.

27.08.2013  
**1.2.0**

* Bugfix: Diaspora changed it's brandname, so the pod-detection-code had to adopt this change.

21.05.2013  
**1.1.2**

* Feature: The Scripts now applies to all Pods (@include changed) and checks whether the embedding site is a diaspora\* instance by checking meta-elements before injecting code.

**1.1.1**

* Added downloadURL and updateURL to the script to let greasemonkey keep you updated automatically.
* Bugfix: The "X new Posts"-Button was counted as new Post when there were more than 1 Post waiting.

20.05.2013  
**1.1**

* Updated to work with Diaspora version 0.1.0.0 and it's new preview-feature.
* Does not hide posts you write - so your newly written post is no longer hidden after submitting.

