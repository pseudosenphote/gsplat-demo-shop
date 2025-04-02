pc.script.createLoadingScreen(function (app) {
    var hideSplash; // Declare here so it's accessible in both functions
    var progressTextElement; // Store reference to the progress text element

    var showSplash = function () {
        // --- CSS for the spinner and progress text ---
        var css = [
            'body {',
            '    margin: 0; /* Ensure no default body margin */',
            '    background-color: #283538; /* Original background color */',
            '    font-family: "Helvetica Neue", Arial, sans-serif; /* Modern font */',
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
            '    flex-direction: column; /* Stack items vertically */', // Added
            '    justify-content: center;',
            '    align-items: center;',
            '    z-index: 1000; /* Make sure its on top */',
            '}',
            '',
            '#loading-spinner {',
            '    width: 50px; /* Size of the spinner */',
            '    height: 50px;',
            '    border: 5px solid rgba(255, 255, 255, 0.2); /* Light grey base circle */',
            '    border-top-color: #ffffff; /* White color for the spinning part */',
            '    border-radius: 50%;',
            '    animation: spin 1s linear infinite; /* Animation definition */',
            '    margin-bottom: 15px; /* Add space below spinner */', // Added
            '}',
            '',
            '#progress-text {', // New style for progress text
            '    color: rgba(255, 255, 255, 0.8); /* Slightly transparent white */',
            '    font-size: 16px;',
            '    font-weight: bold;',
            '    text-align: center;',
            '    /* Optional: Add a subtle text shadow for depth */',
            '    /* text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); */',
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
            '        margin-bottom: 12px;', // Adjust space for smaller spinner
            '    }',
            '    #progress-text {', // Adjust text size for smaller screens
            '        font-size: 14px;',
            '    }',
            '}'
        ].join('\n');

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
        wrapper.id = 'loading-wrapper';
        document.body.appendChild(wrapper);

        // spinner element
        var spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        wrapper.appendChild(spinner);

        // progress text element (NEW)
        progressTextElement = document.createElement('div'); // Assign to the outer scope variable
        progressTextElement.id = 'progress-text';
        progressTextElement.textContent = '0%'; // Initial text
        wrapper.appendChild(progressTextElement); // Add it below the spinner

        // --- Store hide function ---
        hideSplash = function () {
            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement && wrapperElement.parentElement) {
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
             // Attempt to remove the style
             var styleElement = null;
             var headStyles = document.head.querySelectorAll('style[type="text/css"]');
             for (var i = 0; i < headStyles.length; i++) {
                 // More robust check for the specific style content
                 if (headStyles[i].textContent.includes('#loading-wrapper') && headStyles[i].textContent.includes('@keyframes spin')) {
                     styleElement = headStyles[i];
                     break;
                 }
             }
            if(styleElement && styleElement.parentElement) {
                 document.head.removeChild(styleElement);
            }
            progressTextElement = null; // Clear reference
        };
    };

    // --- Progress Update Function --- (NEW)
    var setProgress = function (value) {
        // 'value' is between 0 and 1 (e.g., 0.5 for 50%)
        if (progressTextElement) {
            var percent = Math.floor(value * 100); // Calculate percentage
            progressTextElement.textContent = percent + '%'; // Update the text
        }
    };

    // --- Script execution ---
    showSplash(); // Create and show the spinner and initial text

    // --- Event listeners ---
    app.on('preload:end', function () {
        // Optional: Ensure text shows 100% at the very end
        setProgress(1);
    });

    // Listen for progress updates (NEW)
    app.on('preload:progress', setProgress);

    app.on('start', function () {
        if (hideSplash) {
            hideSplash(); // Call the hide function defined in showSplash
        }
    });
});