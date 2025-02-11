/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

/* sidebar.js */

document.addEventListener('DOMContentLoaded', function() {
    const menuBar = document.getElementById('menu-bar');
    const content = document.getElementById('content');

    menuBar.addEventListener('click', function(event) {
        if (event.target.closest('.menu-option')) {
            const page = event.target.closest('.menu-option').getAttribute('data-page');
            console.log(`Menu option clicked: ${page}`);
            loadPage(page);
        }
    });

    function loadPage(page) {
        console.log(`Loading page: ${page}`);
        fetch(page)
            .then(response => {
                console.log('Response received:', response);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                console.log('Response HTML:', html);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Extract and apply CSS
                const styles = tempDiv.querySelectorAll('link[rel="stylesheet"]');
                styles.forEach(style => {
                    const newStyle = document.createElement('link');
                    newStyle.rel = 'stylesheet';
                    newStyle.href = style.href;
                    document.head.appendChild(newStyle);
                });

                // Extract and execute scripts
                const scripts = tempDiv.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                        newScript.onload = () => {
                            // Initialize capture.js after loading capture.html
                            if (page === 'capture.html') {
                                if (typeof initializeCapture === 'function') {
                                    initializeCapture(); // Call the function from capture.js
                                } else {
                                    console.error('initializeCapture function is not defined.');
                                }
                            }

                            // Initialize TalkToPage.js after loading TalkToPage.html
                            if (page === 'TalkToPage.html') {
                                if (typeof initializeTalkToPage === 'function') {
                                    initializeTalkToPage(); // Call the function from TalkToPage.js
                                } else {
                                    console.error('initializeTalkToPage function is not defined.');
                                }
                            }
                        };
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript); 
                });

                // Update content
                const newContent = tempDiv.querySelector('.content');
                if (newContent) {
                    content.innerHTML = newContent.innerHTML;
                } else {
                    console.error('Error: No element with class "content" found in the loaded page.');
                }

                // Adjust the height and width of the content
                adjustContentDimensions();
            })
            .catch(error => {
                console.error('Error loading page:', error);
            });
    }

    function adjustContentDimensions() {
        const container = document.querySelector('.container');
        const content = document.querySelector('.content');

        // Adjust content height and width as per container dimensions
        content.style.height = `${container.clientHeight - 40}px`; 
        content.style.width = `calc(100% - 40px)`; // Adjusted for padding
    }

    // Adjust the dimensions initially
    adjustContentDimensions();

    // Adjust the dimensions on window resize
    window.addEventListener('resize', adjustContentDimensions);
});