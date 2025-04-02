pc.script.createLoadingScreen(function (app) {
    var hideSplash;
    var progressTextElement;
    var currentPercentage = 0;
    var targetPercentage = 0;
    var progressIntervalId = null;

    // --- Configuration for the "crawl" phase ---
    var crawlThreshold = 75; // Start crawling slowly after reaching this percentage
    var crawlTarget = 99;    // Crawl towards this number (stops just before 100)
    var crawlIntervalCounter = 0;
    // Adjust crawl speed: lower number = faster crawl, higher number = slower crawl
    // This means it will increment the percentage roughly every (crawlSpeed * intervalTime) milliseconds
    // e.g., 15 * 30ms = 450ms per percentage point increase during crawl
    var crawlSpeed = 15;
    // --- End Configuration ---

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
            '    width: 50px; height: 50px; border: 5px solid rgba(255, 255, 255, 0.2);',
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
        crawlIntervalCounter = 0; // Reset crawl counter
        if (progressIntervalId) { clearInterval(progressIntervalId); }
        progressIntervalId = setInterval(updateProgressDisplay, 30); // Update ~33 times/sec

        // --- Store hide function ---
        hideSplash = function () {
            if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
            }
            var wrapperElement = document.getElementById('loading-wrapper');
            if (wrapperElement && wrapperElement.parentElement) {
                wrapperElement.parentElement.removeChild(wrapperElement);
            }
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
            progressTextElement = null;
        };
    };

    // --- Progress Update Function ---
    var setProgress = function (value) {
        targetPercentage = Math.floor(value * 100);
        // Clamp target percentage to prevent it exceeding 100 during potential crawl phase
        if (targetPercentage > 100) {
            targetPercentage = 100;
        }
        // Don't let the target drop below the current display if we are crawling
        if (currentPercentage > targetPercentage && currentPercentage >= crawlThreshold) {
             // Keep the target at least where the crawl has reached,
             // unless a real progress event pushes it higher later.
             targetPercentage = currentPercentage;
        }
    };

    // --- Animation Interval Callback --- (MODIFIED)
    var updateProgressDisplay = function() {
        if (!progressTextElement) return;

        // Always try to reach the target percentage first
        if (currentPercentage < targetPercentage) {
            currentPercentage++;
            progressTextElement.textContent = currentPercentage + '%';
            crawlIntervalCounter = 0; // Reset crawl counter when real progress happens
        }
        // If we've reached the target, AND the target is high enough, AND we're not yet at the crawl limit...
        else if (currentPercentage === targetPercentage && currentPercentage >= crawlThreshold && currentPercentage < crawlTarget) {
            // Start or continue the slow crawl
            crawlIntervalCounter++;
            if (crawlIntervalCounter >= crawlSpeed) {
                currentPercentage++; // Increment slowly
                progressTextElement.textContent = currentPercentage + '%';
                crawlIntervalCounter = 0; // Reset counter for the next crawl increment
            }
        } else {
             // If we are below threshold, or already at/above crawlTarget, reset crawl counter
             crawlIntervalCounter = 0;
        }

        // Safety clamp: Ensure display never exceeds 100 (might happen briefly before start event)
        if (currentPercentage > 100) {
            currentPercentage = 100;
            progressTextElement.textContent = '100%';
        }
    };

    // --- Script execution ---
    showSplash();

    // --- Event listeners ---
    app.on('preload:end', function () {
        // Preload is done, set target to 100%.
        // The interval will quickly count up any remaining difference,
        // or finish the crawl if it was active.
        setProgress(1);
    });

    app.on('preload:progress', setProgress);

    app.on('start', function () {
        // Force 100% display right before hiding, regardless of interval state.
        if (progressTextElement) {
             currentPercentage = 100;
             progressTextElement.textContent = '100%';
        }
        // Hide splash
        if (hideSplash) {
            hideSplash();
        }
    });
});
