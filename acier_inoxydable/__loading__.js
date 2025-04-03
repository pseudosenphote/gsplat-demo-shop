pc.script.createLoadingScreen(function (app) {
    var hideSplash;
    var progressTextElement = null;
    var currentPercentage = 0;
    var targetPercentage = 0;
    var progressIntervalId = null;
    var accelerationThreshold = 75;
    var accelerationTarget = 99;
    var accelerationDuration = 4000;
    var isAcceleratingFinish = false;
    var accelerationStartTime = 0;
    var accelerationStartPercent = 0;
    var fadeOutDuration = 500;

    // Browser Detection
    var ua = navigator.userAgent.toLowerCase();
    var isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium');

    // --- Define New Colors --- (NEW)
    var backgroundColor = '#e6e6e6'; // Light grey background
    var spinnerBaseColor = 'rgba(0, 0, 0, 0.1)'; // Subtle dark base for spinner
    var spinnerActiveColor = '#333333'; // Dark grey for active spinner part
    var textColor = '#333333'; // Dark grey for text

    var showSplash = function () {
        // --- CSS (Updated Colors) ---
        var css = [
            'body {',
            '    margin: 0;',
            '    background-color: ' + backgroundColor + ';', // MODIFIED
            '    font-family: "Helvetica Neue", Arial, sans-serif;',
            '}',
            '',
            '#loading-wrapper {',
            '    position: absolute; top: 0; left: 0; height: 100%; width: 100%;',
            '    background-color: ' + backgroundColor + ';', // MODIFIED
            '    display: flex; flex-direction: column;',
            '    justify-content: center; align-items: center; z-index: 1000;',
            '    opacity: 1;',
            '    transition: opacity ' + (fadeOutDuration / 1000) + 's ease-out;',
            '    pointer-events: auto;',
            '}',
            '',
            '#loading-wrapper.fade-out {',
            '    opacity: 0;',
            '    pointer-events: none;',
            '}',
            '',
            '#loading-spinner {',
            '    width: 50px; height: 50px;',
            '    border: 5px solid ' + spinnerBaseColor + ';', // MODIFIED
            '    border-top-color: ' + spinnerActiveColor + ';', // MODIFIED
            '    border-radius: 50%;',
            '    animation: spin 1s linear infinite;',
             // Conditionally add margin-bottom only if text will be shown
             (isSafari ? 'margin-bottom: 15px;' : ''),
            '}',
            '',
            '#progress-text {', // This rule only applies if the element exists
            '    color: ' + textColor + ';', // MODIFIED
            '    font-size: 16px;',
            '    font-weight: bold; text-align: center; min-width: 40px;',
            '}',
            '',
            '@keyframes spin { to { transform: rotate(360deg); } }',
            '',
            '@media (max-width: 480px) {',
            '    #loading-spinner {',
            '        width: 40px; height: 40px; border-width: 4px;',
                 // Conditionally adjust margin for smaller screens too
                 (isSafari ? 'margin-bottom: 12px;' : ''),
            '    }',
            '    #progress-text {', // Only applies if element exists
            '        font-size: 14px;',
            '    }',
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

        // --- Conditionally create progress text ---
        if (isSafari) {
            progressTextElement = document.createElement('div');
            progressTextElement.id = 'progress-text';
            progressTextElement.textContent = '0%';
            wrapper.appendChild(progressTextElement);
        } else {
            progressTextElement = null;
        }

        // --- Reset state and start interval ---
        currentPercentage = 0;
        targetPercentage = 0;
        isAcceleratingFinish = false;
        accelerationStartTime = 0;
        accelerationStartPercent = 0;

        if (progressIntervalId) { clearInterval(progressIntervalId); }
        progressIntervalId = setInterval(updateProgressDisplay, 20);

        // --- Internal function to remove elements after fade ---
        var removeElementsAfterFade = function() {
            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement && wrapperElement.parentElement) {
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
             var styleElement = null;
             var headStyles = document.head.querySelectorAll('style[type="text/css"]');
             for (var i = 0; i < headStyles.length; i++) {
                 if (headStyles[i].textContent.includes('#loading-wrapper.fade-out')) {
                     styleElement = headStyles[i];
                     break;
                 }
             }
            if(styleElement && styleElement.parentElement) {
                 document.head.removeChild(styleElement);
            }
            progressTextElement = null;
            isAcceleratingFinish = false;
        };

        // --- Store hide function ---
        hideSplash = function () {
            if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
            }

            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement) {
                wrapperElement.classList.add('fade-out');
                setTimeout(removeElementsAfterFade, fadeOutDuration);
            } else {
                removeElementsAfterFade();
            }
        };
    };

    // --- Progress Update Function --- (Unchanged logic)
    var setProgress = function (value) {
        var newTargetPercentage = Math.floor(value * 100);
        targetPercentage = newTargetPercentage;

        if (!isAcceleratingFinish && newTargetPercentage >= accelerationThreshold) {
            isAcceleratingFinish = true;
            accelerationStartTime = Date.now();
            accelerationStartPercent = currentPercentage;
        }
    };

    // --- Animation Interval Callback --- (Unchanged logic)
    var updateProgressDisplay = function() {
        var nextPercentage = currentPercentage;

        if (isAcceleratingFinish) {
            var elapsed = Date.now() - accelerationStartTime;
            var progressRatio = Math.min(elapsed / accelerationDuration, 1.0);
            nextPercentage = Math.floor(accelerationStartPercent + (accelerationTarget - accelerationStartPercent) * progressRatio);
            nextPercentage = Math.min(nextPercentage, accelerationTarget);
        } else {
            if (currentPercentage < targetPercentage) {
                nextPercentage = currentPercentage + 1;
            }
            nextPercentage = Math.min(nextPercentage, targetPercentage);
        }

        if (nextPercentage !== currentPercentage) {
             currentPercentage = nextPercentage;
             if (progressTextElement) { // Update display only if element exists (Safari)
                 progressTextElement.textContent = currentPercentage + '%';
             }
        }
    };


    // --- Script execution ---
    showSplash();

    // --- Event listeners ---
    app.on('preload:end', function () {
        setProgress(1);
    });

    app.on('preload:progress', setProgress);

    app.on('start', function () {
        // --- Final Update and Trigger Hide ---
        currentPercentage = 100;
        if (progressTextElement) { // Update display only if element exists (Safari)
             progressTextElement.textContent = '100%';
        }

        if (hideSplash) {
            hideSplash();
        }
    });
});