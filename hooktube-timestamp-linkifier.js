// ==UserScript==
// @name         Hooktube Timestamp Linkifier
// @version      0.1
// @description  Automatically hyperlink timestamps in Hooktube video descriptions and comments
// @author       Ryan Burns
// @license      https://www.gnu.org/licenses/gpl-3.0.en.html
// @match        https://hooktube.com/watch?v=*
// ==/UserScript==

var timestamp_regex = /(([0-9]+:)?[0-5])?[0-9]:[0-5][0-9]/g;

// Observer to automatically replace timestamps in any added text nodes
timestamper = new MutationObserver(function(mutations) {
    for (var m of mutations)
        for (var node of m.addedNodes)
            findText(node);
});
timestamper.observe(document.getElementById("video-description"), {childList: true});
timestamper.observe(document.getElementById("comments"),          {childList: true});

// Recursively look for text nodes
function findText(node) {
    if (node.nodeType === Node.ELEMENT_NODE)
        for (var child of node.childNodes)
            findText(child);
    else if (node.nodeType === Node.TEXT_NODE)
        replaceText(node);
}

function replaceText(node) {
    // Replace any timestamps in the text with hyperlinks, combining the end result into a span.
    var span = null;
    var txt = node.textContent;
    var m, pos = 0;
    // Loop over the regex matches
    while (m = timestamp_regex.exec(txt)) {
        // If this is the first match, create the span
        if (span === null)
            span = document.createElement("span");
        // Parse minutes/seconds from timestamp
        var segments = m[0].split(":").reverse();
        var secs = +segments[0];
        var mins = +segments[1];
        var hrs = segments.length > 2 ? +segments[2] : 0;
        // Copy the text up to the hyperlink
        span.appendChild(document.createTextNode(txt.substring(pos, m.index)));
        // Create the hyperlink
        var a = document.createElement("a");
        a.appendChild(document.createTextNode(m[0]));
        a.setAttribute("href", "#");
        a.setAttribute("onclick", "document.getElementById('player-obj').currentTime=" + String((hrs*60 + mins)*60 + secs));
        span.appendChild(a);
        // Advance the position marker past the timestamp
        pos = m.index + m[0].length;
    }
    // If we did create a span:
    if (span) {
        // Copy over any remaining text
        span.appendChild(document.createTextNode(txt.substring(pos, txt.length)));
        // Replace the document text with the span
        try {
            node.parentNode.replaceChild(span, node);
		} catch (e) {
			console.error(e);
			console.log(node);
		}
    }
}