/*
 * A fork from George Francis' Generative SVG Starter Kit
 * https://codepen.io/georgedoescode/pen/abBQxBj
 * - Changed canvas to 8.5 x 11 document
 * - Added a download button to save the SVG you've created
 */

import './style.css'
import { SVG } from '@svgdotjs/svg.js';
import '@shoelace-style/shoelace/dist/themes/light.css';

/*
* Instructions:
* - Start your SVG project by editing the svgGenerator function in src/starter-svg.js
* - In this file, main.js, update the name of your new SVG project in the projectTitle variable below
*
**/

import { svgGenerator } from './starter-svg.js';

// Used for the filename of the SVG generated that will be timestamped
// Don't include .svg extension in the name. Also, the filename will
// include a timestamp that starts with an underscore.
const projectTitle = "Starter SVG";

/*
* The code below this point should not need to be changed in most cases.
* Your work should be in your svgGenerator function in src/starter-svg.js
*/

// set the #project-title in the HTML to the projectTitle variable
const projectNameEl = document.getElementById("project-title");
projectNameEl.innerHTML = projectTitle;

// The SVG element already present in the HTML
const svgGenerated = SVG("#svg-canvas");

// regenerate button
const regenerateBtn = document.getElementById("regenerateBtn");

// download button
const downloadBtn = document.getElementById("downloadBtn");

// listen for clicks on the regenerate button
regenerateBtn?.addEventListener("click", () => {
  // redraw the SVG
  svgGenerator(svgGenerated);
});

// draw the SVG for the initial load on page load
window.onload = () => {

  svgGenerator(svgGenerated);
}

downloadBtn?.addEventListener("click", () => {
  downloadSvg();
});

function downloadSvg() {
  // Get the SVG data from the svg function in svg.js
  const svgData = svgGenerated.svg(); // This gets the SVG content

  // Creating a Blob object from the SVG data
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });

  // Creating a URL for the Blob object
  const svgUrl = URL.createObjectURL(svgBlob);

  // Generating a timestamp
  const timestamp = _getTimestamp();

  // Creating a temporary anchor element to trigger download
  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = _toValidFilename(projectTitle) + "_" + timestamp + ".svg"; // Name of the file to be downloaded
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}


function updateTitle() {
  const projectNameEl = document.getElementById("project-title");
  // append the title element witht the projectTitle variable
  const titleElement = document.getElementsByTagName("title")[0];

  const currentTitle = titleElement.innerHTML;
  const newTitle = `${projectTitle} | ${currentTitle}`;
  titleElement.innerHTML = newTitle;
}

updateTitle();

// helper function to convert a string to a valid filename

function _toValidFilename(str) {
    // Replace invalid filename characters with an underscore
  let safeStr = str.replace(/[\\/:*?"<>|]/g, '_');
   // Replace spaces with underscores
    safeStr = safeStr.replace(/\s+/g, '_');
    // Trim leading and trailing spaces
    safeStr = safeStr.trim();
    // Convert to lowercase for case-insensitivity (optional)
    safeStr = safeStr.toLowerCase();
    return safeStr;
}

// helper function to get a timestamp
function _getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = ("0" + now.getDate()).slice(-2);
  const hours = ("0" + now.getHours()).slice(-2);
  const minutes = ("0" + now.getMinutes()).slice(-2);
  const seconds = ("0" + now.getSeconds()).slice(-2);
  return year + month + day + "_" + hours + minutes + seconds;
}
