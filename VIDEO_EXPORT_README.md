# 🎥 Video Export Instructions

Your particle canvas animation can be converted to a video file for TV display.

## 📋 Files Created

1. **`generate-video.html`** - Simple video generator (RECOMMENDED)
2. **`export-video.html`** - Full-featured export tool with preview
3. **`convert-video.js`** - Script to convert WebM to MP4 for TV compatibility

## 🚀 Quick Start

### Option 1: Simple Method (Recommended)

1. Open `generate-video.html` in your browser
2. Select your resolution (1080p or 4K recommended for TV)
3. Set duration (10 seconds is a good loop length)
4. Click "Generate Video"
5. Wait for the download to complete
6. Convert to MP4 using the script below

### Option 2: Advanced Method

1. Open `export-video.html` in your browser
2. Preview the animation first
3. Configure all settings
4. Export the video
5. Convert to MP4

## 🔄 Convert to MP4 for TV

Most TVs don't support WebM format. After generating the video:

```bash
# Install ffmpeg if you don't have it
# macOS:
brew install ffmpeg

# Windows: Download from https://ffmpeg.org/download.html
# Linux:
sudo apt-get install ffmpeg

# Convert the video
node convert-video.js particle-animation-1920x1080-30fps.webm
```

This will create an MP4 file that works on most TVs.

## 📺 TV Display

### Transfer Options:

1. **USB Drive**: Copy the MP4 to a USB drive and plug it into your TV
2. **Media Server**: Use Plex, Jellyfin, or DLNA to stream to your TV
3. **TV App**: Some smart TVs have file browser apps that can play from USB

### Loop Settings:

Most TV media players will:
- Automatically loop if you set it to "Repeat" or "Loop" mode
- Play the file once and stop (you may need to enable loop/repeat)

### Recommended Settings:

- **Resolution**: 1920x1080 (Full HD) or 3840x2160 (4K)
- **Duration**: 10-30 seconds for a good looping video
- **Frame Rate**: 30 FPS (24 works too, 60 may be too much)
- **Format**: MP4 (H.264 codec)

## 🎨 Current Animation

- 100 golden particles (#D4A574)
- Orange-brown gradient background
- Particles connect with lines when close
- Smooth bouncing off edges
- Fade trail effect

## ⚠️ Troubleshooting

**"MediaRecorder not supported"**
- Use Chrome, Edge, or newer Firefox
- Make sure you're on HTTPS or localhost

**"Export is too slow"**
- Reduce resolution
- Lower frame rate
- Shorter duration

**"TV won't play the video"**
- Make sure you converted to MP4
- Try different resolutions
- Check TV's supported codecs

**"File too large"**
- Reduce resolution
- Shorter duration
- Lower frame rate

## 💡 Tips

- For a 30-second loop, generate a 10-second video and repeat it 3 times
- Test on your TV with a short clip first
- 1080p is usually enough unless you have a 4K TV
- Some TVs support HDR - you can enhance colors if your TV supports it

## 🎬 Alternative: Use ffmpeg for Direct MP4 Export

If you want to avoid the conversion step, you can modify the HTML to use a different approach, but browser-based MP4 encoding is limited. The WebM → MP4 conversion is the most reliable method.

Enjoy your animated background! 🎉

