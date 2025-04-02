pc.script.createLoadingScreen(function (app) {
    var hideSplash; // Declare here so it's accessible in both functions

    var showSplash = function () {
        // --- CSS for the new spinner ---
        var css = [
            'body {',
            '    margin: 0; /* Ensure no default body margin */',
            '    background-color: #283538; /* Original background color, change if needed */',
            '}',
            '',
            '#loading-wrapper {',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    height: 100%;',
            '    width: 100%;',
            '    background-color: #283538; /* Match body or make transparent */',
            '    display: flex; /* Use flexbox for easy centering */',
            '    justify-content: center;',
            '    align-items: center;',
            '    z-index: 1000; /* Make sure its on top */', // Ligne 22 (elle est correcte)
            '}',
            '',
            '#loading-spinner {',
            '    width: 50px; /* Size of the spinner */',
            '    height: 50px;',
            '    border: 5px solid rgba(255, 255, 255, 0.2); /* Light grey base circle */',
            '    border-top-color: #ffffff; /* White color for the spinning part */',
            '    border-radius: 50%;',
            '    animation: spin 1s linear infinite; /* Animation definition */',
            '}',
            '',
            '@keyframes spin {',
            '    to { transform: rotate(360deg); }',
            '}',
            '',
            '@media (max-width: 480px) {', // Optional: smaller spinner on small screens
            '    #loading-spinner {',
            '        width: 40px;',
            '        height: 40px;',
            '        border-width: 4px;',
            '    }',
            '}' // <<-- NOTEZ L'ABSENCE DE VIRGULE ICI (c'est la dernière ligne avant le ']')
        ].join('\n'); // Fin du tableau css

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);

        // --- HTML elements ---
        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'loading-wrapper'; // Use a more generic ID
        document.body.appendChild(wrapper);

        // spinner element
        var spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        wrapper.appendChild(spinner);

        // --- Store hide function ---
        // Define hideSplash here so it can access 'wrapper' and 'style'
        hideSplash = function () {
            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement && wrapperElement.parentElement) { // Check parentElement exists
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
            // Attempt to remove the style - be careful with generic selectors
             var styleElement = null;
             var headStyles = document.head.querySelectorAll('style[type="text/css"]');
             for (var i = 0; i < headStyles.length; i++) {
                 if (headStyles[i].textContent.includes('@keyframes spin')) {
                     styleElement = headStyles[i];
                     break;
                 }
             }
            if(styleElement && styleElement.parentElement) { // Check parentElement exists
                 document.head.removeChild(styleElement);
            }
        };
    };


    // --- Script execution ---
    showSplash(); // Create and show the spinner immediately

    // --- Event listeners ---
    app.on('preload:end', function () {
        // Nothing specific needed here for preload end with this simple spinner
    });

    // No progress listener needed
    // app.on('preload:progress', setProgress);

    app.on('start', function () {
        if (hideSplash) {
            hideSplash(); // Call the hide function defined in showSplash
        }
    });
});