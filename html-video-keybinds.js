// ==UserScript==
// @name         HTML Video Keybinds
// @version      0.1
// @description  Use Youtube keyboard shortcuts for HTML video embeds
// @author       Ryan Burns
// @license      https://www.gnu.org/licenses/gpl-3.0.txt
// @include      *
// ==/UserScript==

function bindEvents(vid, target) {

    function playpause() {
        vid.focus();
        vid.paused ? vid.play() : vid.pause();
    }

    function fullscreen() {
        vid.focus();
        if (document.webkitIsFullScreen)
            document.webkitExitFullscreen();
        else
            vid.webkitRequestFullscreen();
    }

    const keypressfuncs = {
        'k': playpause,
        '.': function() { vid.currentTime += 1/30; },
        ',': function() { vid.currentTime -= 1/30; },
        ']': function() { vid.playbackRate += 0.1; },
        '[': function() { vid.playbackRate -= 0.1; },
        '?': function() { vid.playbackRate = 1; },
        'f': fullscreen,
        'm': function() { vid.muted = !vid.muted; },
        '0': function() { vid.currentTime = 0; },
        '1': function() { vid.currentTime = vid.duration * 1/10; },
        '2': function() { vid.currentTime = vid.duration * 2/10; },
        '3': function() { vid.currentTime = vid.duration * 3/10; },
        '4': function() { vid.currentTime = vid.duration * 4/10; },
        '5': function() { vid.currentTime = vid.duration * 5/10; },
        '6': function() { vid.currentTime = vid.duration * 6/10; },
        '7': function() { vid.currentTime = vid.duration * 7/10; },
        '8': function() { vid.currentTime = vid.duration * 8/10; },
        '9': function() { vid.currentTime = vid.duration * 9/10; },
    };

    const keydownfuncs = {
        'ArrowRight': function() { vid.currentTime += 5; },
        'ArrowLeft':  function() { vid.currentTime -= 5; },
        'ArrowUp':    function() { vid.volume = Math.min(1, vid.volume + 0.1); },
        'ArrowDown':  function() { vid.volume = Math.max(0, vid.volume - 0.1); },
    };

    if (!target)
        target = vid;

    // bind event functions
    vid.onclick    = playpause;
    vid.ondblclick = fullscreen;
    // must bind key events to document for direct videos
    document.addEventListener("keypress", function(e) {
        if (e.target === target) {
            const func = keypressfuncs[e.key];
            if (func)
                func();
        }
    });
    document.addEventListener("keydown", function(e) {
        if (e.target === target && !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
            func = keydownfuncs[e.key];
            if (func) {
                func();
                e.stopPropagation();
            }
        }
    });
}

if (document.body.childElementCount === 1 &&
    document.body.firstElementChild instanceof HTMLVideoElement) {
    bindEvents(document.body.firstElementChild, document.body);
} else {
    (new MutationObserver(function (mutations) {
        for (const m of mutations)
            for (const node of m.addedNodes)
                if (node instanceof HTMLVideoElement && node.controls)
                    bindEvents(node);
    })).observe(document.body, {
        childList: true,
        attributes: true,
        attributeFilter: ["controls"],
        subtree: true
    });
}