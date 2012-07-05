var shorten9tc = {

//--------------------------------------------------------------------
// Basic constants.

    __ZERO:            0 ,      // Zero
    __ONE:             1 ,      // One

//--------------------------------------------------------------------
// 9.tc operation mode numbers.

    __MODE_COPY:       1 ,      // Copy string to clipboard
    __MODE_TWEET:      2 ,      // Send to Twitter
    __MODE_FACEBOOK:   3 ,      // Send to Facebook
    __MODE_EMAIL:      4 ,      // Email string
    __MODE_FRIENDFEED: 5 ,      // Send to FriendFeed

//--------------------------------------------------------------------
// JS function: Main URL processor.

// Future change: This routine should be documented more completely.

// Note:  "tcmode"  should be  one of the  "__MODE_..." 9.tc operation
// mode numbers.

    shorten9tcMain: function (tcmode) {
                                // This part will need to be  modified
                                // for different "shorten" sites
        var actionURL =
            'http://9.tc/api.php?format=xml&action=shorturl&url=';

        var node      = document.popupNode;
        var loc       = content.document.location + "";

                                // Handle right-click on image
        var onImage = false;
        if (node instanceof
                Components.interfaces.nsIImageLoadingContent
                && node.currentURI) {
            onImage = true;
            loc     = node.src + "";
        }
                                // Handle right-click on link
        var onLink = false;
        if (node instanceof HTMLAnchorElement && node.href) {
            onLink = true;
            loc    = node.href + "";
        }
                                // This part will need to be  modified
                                // for different "shorten" sites
        if ((loc.length < shorten9tc.__ONE)
|| loc == 'about:blank'
|| loc.substring (shorten9tc.__ZERO, 11) == 'http://9.tc') {
            alert ('Invalid or missing URL');
            return;
        }
                                // Build action URL
        // alert ('DEBUG Original URL is ' + loc);
        var url = actionURL + window.encodeURIComponent (loc);
        // alert ('DEBUG Action   URL is ' + url);

        var request = new XMLHttpRequest();
        request.open ("GET", url, true);

        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                                // Holds short-URL text
                var urltext = null;
                                // Handle HTTP-level errors
                if (request.status != 200) {
                    alert ("HTTP error " + request.status);
                    return;
                }
                                // This code assumes that  we're using
                                // an  XML API  for the current short-
                                // URL site
                var results = request.responseXML;

                                // Name  of  the tag  that  holds  the
                                // shortened URL
                var urltag  = 'shorturl';

                                // Try  to  extract the  shortened URL
                                // Proceed cautiously to avoid  silent
                                // aborts
                if (results != null) {
                    try {
                        urltext = results
                            .getElementsByTagName (urltag)[0]
                            .firstChild.data;
                        if (urltext.length == 0) { urltext = null; }
                    }
                    catch (err) { urltext = null; }
                }
                                // If  extraction  failed,  advise the
                                // user and exit
                if (urltext == null) {
                    alert ("Couldn't make a short URL");
                    return;
                }

                // alert ('DEBUG Shortened URL is ' + urltext);

                                // Perform  requested  operation  with
                                // shortened URL
                if (tcmode == shorten9tc.__MODE_COPY)
                    shorten9tc.copyToClipboard (urltext);
                if (tcmode == shorten9tc.__MODE_TWEET)
                    shorten9tc.tweetThis       (urltext);
                if (tcmode == shorten9tc.__MODE_FACEBOOK)
                    shorten9tc.faceBookThis    (urltext);
                if (tcmode == shorten9tc.__MODE_EMAIL)
                    shorten9tc.emailThis       (urltext);
                if (tcmode == shorten9tc.__MODE_FRIENDFEED)
                    shorten9tc.friendFeedThis  (urltext);
            }
        }

        request.send (null);
    } ,

//--------------------------------------------------------------------
// JS function: Simple routine that calls main processor.

    shorten9tc: function (tcmode) {
        shorten9tc.shorten9tcMain (tcmode);
    } ,

//--------------------------------------------------------------------
// JS routine: (Event handler) Shorten URL and copy it.

    onMenuClick: function (event) {
        shorten9tc.shorten9tc (shorten9tc.__MODE_COPY);
    } ,

//--------------------------------------------------------------------
// JS function: Copy string to clipboard.

    copyToClipboard: function (str) {

// This code relies on the following Mozilla component:
//
//    @mozilla.org/widget/clipboardhelper;1
//
// The component in question provides a clipboard service. In particu-
// lar, it implements an interface named "nsIClipboardHelper". The in-
// terface provides a function named  "copyString" that can be used to
// copy a string to the clipboard.
//
// The ".getservice" assignment here binds "nsIClipboardHelper" to the
// "clipboard" variable,  making  it possible to call  the interface's
// functions through the variable. The statement after the  assignment
// does exactly this and uses  "copyString" to copy the shortened  URL
// that we obtained previously.

        var clipboard =
Components.classes ["@mozilla.org/widget/clipboardhelper;1"]
.getService (Components.interfaces.nsIClipboardHelper);

        clipboard.copyString (str);
        alert ('Copied: ' + str);
    } ,

//--------------------------------------------------------------------
// JS function: Shorten URL and Tweet it.

    onTweetURL: function() {
        shorten9tc.shorten9tc (shorten9tc.__MODE_TWEET);
    } ,

//--------------------------------------------------------------------
// JS function: "Tweet" a string.

    tweetThis: function (str) {
        alert ("Tweeting this: " + str);
        var newURL =
            "http://twitter.com/?status="
            + encodeURIComponent
                  (content.document.title + ": " + str);

        // alert ('DEBUG Twitter URL is ' + newURL);
        shorten9tc.openPage (newURL);
    } ,

//--------------------------------------------------------------------
// JS function: Shorten URL and Facebook it.

    onFaceBookURL: function() {
        shorten9tc.shorten9tc (shorten9tc.__MODE_FACEBOOK);
    } ,

//--------------------------------------------------------------------
// JS function: "Facebook" a string.

    faceBookThis: function (str) {
        alert ("Facebooking this: " + str);
        var newURL =
            "http://facebook.com/sharer.php?u="
            + encodeURIComponent
                  (str + "&t=" + content.document.title);

        // alert ('DEBUG Facebook URL is ' + newURL);
        shorten9tc.openPage (newURL);
    } ,

//--------------------------------------------------------------------
// JS function: Shorten URL and Email it.

    onEmailURL: function () {
        shorten9tc.shorten9tc (shorten9tc.__MODE_EMAIL);
    } ,

//--------------------------------------------------------------------
// JS function: Email a string.

    emailThis: function (str) {
        alert ("Mailing this: " + str);

        var textWindow = document.commandDispatcher.focusedWindow;
        var text       = textWindow.getSelection() + "";
        var body       = "";

        if (text != null && text != "")
            body = encodeURIComponent (text) + "\n"
                + '%0D%0A' + '%0D%0A' + str + '';
        else
            body = str + '';

// This code works  similarly  to the  clipboard code that's discussed
// further up.  It relies on the following  Mozilla components,  which
// provide "external protocol" and I/O services, respectively:
//
//    @mozilla.org/uriloader/external-protocol-service;1
//    @mozilla.org/network/io-service;1
//
// These services implement associated interfaces named  "nsIExternal-
// ProtocolService" and "nsIIOService", respectively. The first inter-
// face  defines a function named  "newURI" that  can be used  to con-
// struct a  Mozilla-compatible URI.  The second  interface  defines a
// function named "loadUrl" that can  be used to load a URI after it's
// constructed.
//
// The ".getService" assignments used here bind the services  in ques-
// tion to the variables  "epService" and  "ioService",  respectively.
// Subsequently, the variables are used to call "newURI" (to construct
// a URI) and "loadUrl" (to load the constructed URI).

        var epService       = Components.classes
["@mozilla.org/uriloader/external-protocol-service;1"]
.getService (Components.interfaces.nsIExternalProtocolService);

        var ioService = Components.classes
["@mozilla.org/network/io-service;1"]
.getService (Components.interfaces.nsIIOService);

        var mailtourl = "mailto:?subject="
            + encodeURIComponent (content.document.title)
            + "&body=" + body;

        var uri = ioService.newURI (mailtourl, null, null);
        epService.loadUrl (uri);
    } ,

//--------------------------------------------------------------------
// JS function: Shorten URL and "FriendFeed" it.

    onFriendFeedURL: function() {
        shorten9tc.shorten9tc (shorten9tc.__MODE_FRIENDFEED);
    } ,

//--------------------------------------------------------------------
// JS function: "FriendFeed" a string.

    friendFeedThis: function (str) {
        alert ("FriendFeeding this: " + str);
        var newURL =
            "http://friendfeed.com/share/bookmarklet/frame#title="
            + encodeURIComponent (str);

        // alert ('DEBUG FriendFeed URL is ' + newURL);
        shorten9tc.openPage (newURL);
    } ,

//--------------------------------------------------------------------
// JS function: Open a specified web page.

    openPage: function (sURL) {

// This code works  similarly  to the  clipboard code that's discussed
// further up.  It  relies on the following  Mozilla component,  which
// provides a "window mediator" service:
//
//    @mozilla.org/appshell/window-mediator;1
//
// This service implements an  associated interface named  "nsIWindow-
// Mediator". The interface in question defines a function named "get-
// MostRecentWindow" that can be used to obtain a handle  for the cur-
// rent browser window.
//
// The ".getService" assignment used here  binds the  service in ques-
// tion to the  variable "wm". Subsequently,  the variable  is used to
// call "getMostRecentWindow". The handle  returned by the latter rou-
// tine is then used to open the URL specified by "sURL".

        var wm = Components.classes
["@mozilla.org/appshell/window-mediator;1"]
.getService (Components.interfaces.nsIWindowMediator);

        var mainWindow = wm.getMostRecentWindow ("navigator:browser");
        mainWindow.gBrowser.selectedTab =
            mainWindow.gBrowser.addTab (sURL);
        mainWindow.focus();
    }
};
