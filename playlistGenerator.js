// ==UserScript==
// @name         Generate Test Playlist
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Extract test names and generate a playlist file for Visual Studio Test Explorer on Ctrl + \ key press.
// @author       Karol
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("Tampermonkey script is running!");

    // Function to extract the test names from the HTML
    function extractTestNames() {
        const testList = [];
        // Updated selector to target the <a> tags inside the correct <td>
        const testElements = document.querySelectorAll('td[style*="vertical-align:middle"] ul li a');

        // Log testElements for debugging
        console.log('Found testElements:', testElements);

        // Log if test elements are found
        if (testElements.length === 0) {
            console.log('No test elements found');
        } else {
            console.log('Test elements found:', testElements.length);
        }

        // Loop through each element and extract the text (test names)
        testElements.forEach(el => {
            const testName = el.textContent.trim();
            console.log('Extracted test name:', testName); // Log each test name
            testList.push(testName);
        });

        return testList;
    }

    // Function to generate a .playlist file content
    function generatePlaylistContent(testNames) {
        let playlistContent = '<?xml version="1.0" encoding="utf-8"?><Playlist Version="1.0">';
        testNames.forEach(testName => {
            playlistContent += `<Add Test="${testName}" />`;
        });
        playlistContent += '</Playlist>';

        return playlistContent;
    }

    // Function to create and download the .playlist file
    function downloadPlaylistFile(playlistContent, fileName) {
        const blob = new Blob([playlistContent], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.playlist`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log('Playlist file download triggered');
    }

    // Function to handle the key press event
    function handleKeyPress(event) {
        // Check if the Ctrl key is pressed and the key is backslash
        if (event.ctrlKey && event.key === '\\') {
            console.log('Ctrl + \\ pressed');
            const testNames = extractTestNames();
            if (testNames.length > 0) {
                const playlistContent = generatePlaylistContent(testNames);

                // Extract the file name from the first test name
                const firstTestName = testNames[0];
                const envName = firstTestName.split('NightlyBuild_')[1]; // Take the part before the first dot
                const lastTestName = testNames[testNames.length - 1];
                const className = lastTestName.split('.')[0];
                const fileName = `${envName}_${className}`; // You can change '_' to another separator if needed


                downloadPlaylistFile(playlistContent, fileName);
            } else {
                console.log('No test names found to generate a playlist.');
            }
        }
    }

    // Add event listener for key presses
    window.addEventListener('keydown', handleKeyPress);

    // Set up for page fully loaded
    window.addEventListener('load', () => {
        console.log("Page is fully loaded, ready to listen for key events...");
    });

})();
