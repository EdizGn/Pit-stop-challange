/*
 * Copyright 2010, Google Inc.
 * webgl-utils.js - minimal version
 */

var WebGLUtils = (function() {
    function setupWebGL(canvas, opt_attribs) {
        function showLink(str) {
            var container = canvas.parentNode;
            if (container) {
                container.innerHTML = makeFailHTML(str);
            }
        }
        if (!window.WebGLRenderingContext) {
            showLink("This browser does not support WebGL.");
            return null;
        }
        var context = create3DContext(canvas, opt_attribs);
        if (!context) {
            showLink("It seems the GPU is not able to run WebGL.");
        }
        return context;
    }

    function create3DContext(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try { context = canvas.getContext(names[ii], opt_attribs); }
            catch(e) {}
            if (context) break;
        }
        return context;
    }

    return { setupWebGL: setupWebGL, create3DContext: create3DContext };
}());

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(callback, element) { window.setTimeout(callback, 1000/60); };
})();
