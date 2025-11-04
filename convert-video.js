#!/usr/bin/env node

/**
 * Video Converter Script
 * Converts WebM files to MP4 for TV compatibility
 * 
 * Requires ffmpeg to be installed:
 * - macOS: brew install ffmpeg
 * - Windows: Download from https://ffmpeg.org/download.html
 * - Linux: sudo apt-get install ffmpeg
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the WebM file path from command line or use default
const inputFile = process.argv[2] || null;

if (!inputFile) {
    console.log(`
Usage: node convert-video.js <input.webm>

This script converts a WebM video file to MP4 format suitable for TV playback.

Example:
  node convert-video.js particle-animation-1920x1080-30fps.webm

Requirements:
  - ffmpeg must be installed on your system
  - Run 'brew install ffmpeg' on macOS if not installed
`);
    process.exit(1);
}

// Check if file exists
if (!fs.existsSync(inputFile)) {
    console.error(`Error: File "${inputFile}" not found.`);
    process.exit(1);
}

// Check if ffmpeg is installed
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
    console.error(`
Error: ffmpeg is not installed or not found in PATH.

Please install ffmpeg:
  macOS:   brew install ffmpeg
  Windows: Download from https://ffmpeg.org/download.html
  Linux:   sudo apt-get install ffmpeg
`);
    process.exit(1);
}

// Generate output filename
const ext = path.extname(inputFile);
const outputFile = inputFile.replace(ext, '.mp4');

console.log(`Converting "${inputFile}" to "${outputFile}"...`);

try {
    // Convert WebM to MP4 with TV-compatible settings
    const command = `ffmpeg -i "${inputFile}" -c:v libx264 -preset slow -crf 22 -c:a copy -movflags +faststart "${outputFile}"`;
    
    console.log('Running ffmpeg...');
    execSync(command, { stdio: 'inherit' });
    
    console.log(`\n✅ Success! Converted video saved as: "${outputFile}"`);
    console.log(`\nThis MP4 file should work on most TVs. Transfer it via USB or media server.`);
    
} catch (error) {
    console.error('\n❌ Conversion failed. Please check the error messages above.');
    process.exit(1);
}

