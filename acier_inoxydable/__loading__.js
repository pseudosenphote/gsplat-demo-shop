pc.script.createLoadingScreen(function (app) {
    var hideSplash;
    var progressTextElement;
    var currentPercentage = 0;
    var targetPercentage = 0;
    var progressIntervalId = null;
    var MAX_DISPLAY_PERCENTAGE_BEFORE_END = 99; // Define the fake ceiling

    var showSplash = function () {
        // --- CSS (Keep the CSS from the previous version) ---
        var css = [
            'body {',
            '    margin: 0; background-color: #283538;',
            '    font-family: "Helvetica Neue", Arial, sans-serif;',
            '}',
            '#loading-wrapper {',
            '    position: absolute; top: 0; left: 0; height: 100%; width: 100%;',
            '    background-color: #283538; display: flex; flex-direction: column;',
            '    justify-content: center; align-items: center; z-index: 1000;',
            '}',
            '#loading-spinner {',
            '    width: 50px; height: 50px;',
            '    border: 5px solid rgba(255, 255, 255, 0.2);',
            '    border-top-color: #ffffff; border-radius: 50%;',
            '    animation: spin 1s linear infinite; margin-bottom: 15px;',
            '}',
            '#progress-text {',
            '    color: rgba(255, 255, 255, 0.8); font-size: 16px;',
            '    font-weight: bold; text-align: center; min-width: 40px;',
            '}',
            '@keyframes spin { to { transform: rotate(360deg); } }',
            '@media (max-width: 480px) {',
            '    #loading-spinner { width: 40px; height: 40px; border-width: 4px; margin-bottom: 12px; }',
            '    #progress-text { font-size: 14px; }',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) { style.styleSheet.cssText = css; }
        else { style.appendChild(document.createTextNode(css)); }
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
        progressTextElement.textContent = '0%';
        wrapper.appendChild(progressTextElement);

        // --- Start the animation interval ---
        currentPercentage = 0;
        targetPercentage = 0;
        if (progressIntervalId) { clearInterval(progressIntervalId); }
        progressIntervalId = setInterval(updateProgressDisplay, 30); // Adjust speed if needed

        // --- Store hide function ---
        hideSplash = function () {
            if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
            }

            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement?.parentElement) { // Optional chaining
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
            // Remove style
            var styleElement = null;
            var headStyles = document.head.querySelectorAll('style[type="text/css"]');
            for (var i = 0; i < headStyles.length; i++) {
                if (headStyles[i].textContent.includes('#loading-wrapper') && headStyles[i].textContent.includes('@keyframes spin')) {
                    styleElement = headStyles[i];
                    break;
                }
            }
            if (styleElement?.parentElement) { // Optional chaining
                document.head.removeChild(styleElement);
            }
            progressTextElement = null;
        };
    };

    // --- Progress Update Function --- (MODIFIED with mapping)
    var setProgress = function (value) { // value is 0.0 to 1.0
        var actualProgress = value;
        var mappedTarget;

        // Map the 0.0 - 0.75 range to 0 - 99% display range
        if (actualProgress < 0.75) {
            // Calculate the proportion through the 0-75% range
            var proportion = actualProgress / 0.75;
            // Scale this proportion to the 0-99% display range
            mappedTarget = Math.floor(proportion * MAX_DISPLAY_PERCENTAGE_BEFORE_END);
        } else {
            // If actual progress is 75% or more, clamp display to 99%
            mappedTarget = MAX_DISPLAY_PERCENTAGE_BEFORE_END;
        }

        // Update the target, the interval will animate towards it
        targetPercentage = mappedTarget;
    };

    // --- Animation Interval Callback --- (No changes needed here)
    var updateProgressDisplay = function() {
        if (!progressTextElement) return;

        if (currentPercentage < targetPercentage) {
            currentPercentage++;
            progressTextElement.textContent = currentPercentage + '%';
        } else if (currentPercentage > targetPercentage) {
            // Handle potential decrease (though unlikely for loading)
            currentPercentage = targetPercentage;
            progressTextElement.textContent = currentPercentage + '%';
        }
        // Prevent exceeding the fake max before the 'start' event
        if (currentPercentage > MAX_DISPLAY_PERCENTAGE_BEFORE_END) {
             currentPercentage = MAX_DISPLAY_PERCENTAGE_BEFORE_END;
             progressTextElement.textContent = currentPercentage + '%';
        }
    };

    // --- Script execution ---
    showSplash();

    // --- Event listeners ---
    app.on('preload:end', function () {
        // When actual preloading ends, ensure the target is set to 99%
        // (in case the last progress event was < 0.75)
        setProgress(1.0); // This will set targetPercentage to 99 via our mapping
    });

    app.on('preload:progress', setProgress); // Calls the modified setProgress

    app.on('start', function () {
        // App is ready to start, force display to 100% just before hiding
        if (progressTextElement) {
             // Stop the interval first
             if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
             }
             // Force the display
             currentPercentage = 100;
             progressTextElement.textContent = '100%';
        }

        // Short delay to potentially make 100% visible (optional, adjust/remove if needed)
        // setTimeout(function() {
            if (hideSplash) {
                hideSplash(); // Hide splash (also cleans up interval again just in case)
            }
        // }, 50); // 50ms delay
    });
});
