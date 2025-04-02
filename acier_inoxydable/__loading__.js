pc.script.createLoadingScreen(function (app) {
    var hideSplash; // Declare here so it's accessible in both functions
    var progressTextElement; // Store reference to the progress text element
    var currentPercentage = 0; // The percentage currently displayed
    var targetPercentage = 0; // The actual loaded percentage
    var progressIntervalId = null; // To store the interval ID for cleanup

    var showSplash = function () {
        // --- CSS (Keep the CSS from the previous version, it's good) ---
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
            '    flex-direction: column; /* Stack items vertically */',
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
            '    margin-bottom: 15px; /* Add space below spinner */',
            '}',
            '',
            '#progress-text {',
            '    color: rgba(255, 255, 255, 0.8); /* Slightly transparent white */',
            '    font-size: 16px;',
            '    font-weight: bold;',
            '    text-align: center;',
            '    min-width: 40px; /* Prevent layout shifts as number changes */',
            '}',
            '',
            '@keyframes spin {',
            '    to { transform: rotate(360deg); }',
            '}',
            '',
            '@media (max-width: 480px) {',
            '    #loading-spinner {',
            '        width: 40px;',
            '        height: 40px;',
            '        border-width: 4px;',
            '        margin-bottom: 12px;',
            '    }',
            '    #progress-text {',
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
        var wrapper = document.createElement('div');
        wrapper.id = 'loading-wrapper';
        document.body.appendChild(wrapper);

        var spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        wrapper.appendChild(spinner);

        progressTextElement = document.createElement('div');
        progressTextElement.id = 'progress-text';
        progressTextElement.textContent = '0%'; // Initial text
        wrapper.appendChild(progressTextElement);

        // --- Start the animation interval --- (NEW)
        currentPercentage = 0; // Reset on show
        targetPercentage = 0;  // Reset on show
        if (progressIntervalId) { // Clear any previous interval if splash is shown again
             clearInterval(progressIntervalId);
        }
        progressIntervalId = setInterval(updateProgressDisplay, 30); // Update ~33 times/sec

        // --- Store hide function ---
        hideSplash = function () {
            // Stop the animation interval (NEW)
            if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
            }

            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement && wrapperElement.parentElement) {
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
             // Attempt to remove the style
             var styleElement = null;
             var headStyles = document.head.querySelectorAll('style[type="text/css"]');
             for (var i = 0; i < headStyles.length; i++) {
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

    // --- Progress Update Function --- (MODIFIED)
    var setProgress = function (value) {
        // Update the target percentage, the interval will handle the display
        targetPercentage = Math.floor(value * 100);
    };

    // --- Animation Interval Callback --- (NEW)
    var updateProgressDisplay = function() {
        if (!progressTextElement) return; // Exit if element doesn't exist

        // If current display is less than the target, increment it
        if (currentPercentage < targetPercentage) {
            currentPercentage++;
            progressTextElement.textContent = currentPercentage + '%';
        } else if (currentPercentage > targetPercentage) {
            // Optional: Handle cases where progress might somehow decrease
            // (usually not needed for loading, but safe to include)
            currentPercentage = targetPercentage;
            progressTextElement.textContent = currentPercentage + '%';
        }
        // If current equals target, the interval continues running but does nothing
        // until targetPercentage changes again.
    };


    // --- Script execution ---
    showSplash(); // Create/show elements and start the animation interval

    // --- Event listeners ---
    app.on('preload:end', function () {
        // Ensure the target is 100% when preloading finishes
        setProgress(1); // This sets targetPercentage = 100
        // The interval will now count up to 100 if it's not already there.
    });

    // Listen for progress updates (MODIFIED - only updates target)
    app.on('preload:progress', setProgress);

    app.on('start', function () {
        // Ensure the display *immediately* shows 100% right before hiding
        // in case the interval hasn't caught up fully.
        if (progressTextElement) {
             currentPercentage = 100; // Force display update
             progressTextElement.textContent = '100%';
        }
        // Then hide the splash screen
        if (hideSplash) {
            hideSplash(); // This also clears the interval
        }
    });
});
