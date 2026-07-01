import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader, RotateCcw } from 'lucide-react';

export default function VideoPlayer({ src, poster, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Initialize HLS Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);
    let hls = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS Network error:", data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS Media error:", data);
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal HLS error:", data);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
    } else {
      console.error("HLS playback is not supported in this browser.");
      setIsLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  // Handle auto-hide controls
  useEffect(() => {
    let timeoutId;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSpeedMenu(false);
        }
      }, 3500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(timeoutId);
    };
  }, [isPlaying]);

  // Video Events
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log("Playback failed:", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = parseFloat(e.target.value);
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleToggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlaybackSpeed = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const padZero = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    return `${minutes}:${padZero(seconds)}`;
  };

  return (
    <div 
      ref={containerRef} 
      className={`custom-video-player ${isFullscreen ? 'fullscreen' : ''} ${!showControls ? 'hide-cursor' : ''}`}
    >
      {isLoading && (
        <div className="player-loader-overlay">
          <Loader className="loader-spin" size={48} />
        </div>
      )}

      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onClick={handlePlayPause}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        className="video-element"
      />

      {/* Control Bar Overlay */}
      <div className={`player-controls-overlay ${showControls ? 'visible' : ''}`}>
        
        {/* Top title info */}
        <div className="player-top-bar">
          <h2 className="player-video-title">{title}</h2>
        </div>

        {/* Big play button center overlay */}
        {!isPlaying && !isLoading && (
          <button className="center-play-button" onClick={handlePlayPause}>
            <Play size={32} fill="#fff" stroke="none" />
          </button>
        )}

        <div className="player-bottom-controls glass-panel">
          
          {/* Progress Timeline */}
          <div className="timeline-container">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="timeline-slider"
              style={{
                background: `linear-gradient(to right, var(--primary) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%)`
              }}
            />
          </div>

          <div className="controls-row">
            <div className="controls-left">
              <button onClick={handlePlayPause} className="control-btn play-btn" aria-label="Play or Pause">
                {isPlaying ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
              </button>

              <div className="volume-control-wrapper">
                <button onClick={handleToggleMute} className="control-btn volume-btn" aria-label="Mute or Unmute">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                  }}
                />
              </div>

              <span className="time-display">
                {formatTime(currentTime)} <span className="time-divider">/</span> {formatTime(duration)}
              </span>
            </div>

            <div className="controls-right">
              {/* Speed Menu trigger */}
              <div className="speed-control-wrapper">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                  className="control-btn settings-btn"
                  title="Playback Speed"
                >
                  <Settings size={20} className={showSpeedMenu ? 'rotate-icon' : ''} />
                  <span className="speed-label-badge">{playbackRate}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="speed-dropdown glass-panel">
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <button 
                        key={rate} 
                        onClick={() => handlePlaybackSpeed(rate)}
                        className={`speed-option ${rate === playbackRate ? 'active' : ''}`}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleToggleFullscreen} className="control-btn fullscreen-btn" aria-label="Fullscreen">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-video-player {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-premium);
          border: 1px solid var(--border-color);
        }

        .custom-video-player.fullscreen {
          width: 100vw;
          height: 100vh;
          aspect-ratio: auto;
          border-radius: 0;
          border: none;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .hide-cursor {
          cursor: none;
        }

        /* Loading Spinner overlay */
        .player-loader-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }

        .loader-spin {
          color: var(--primary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Controls overlay */
        .player-controls-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.7) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .player-controls-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .player-top-bar {
          padding: 1.5rem;
        }

        .player-video-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        /* Play center button */
        .center-play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-orange);
          transition: var(--transition-bounce);
          z-index: 6;
          border: none;
          padding-left: 4px; /* offset play icon slightly */
        }

        .center-play-button:hover {
          transform: translate(-50%, -50%) scale(1.1);
        }

        /* Bottom Controls Bar */
        .player-bottom-controls {
          margin: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 16, 20, 0.85);
          box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }

        .timeline-container {
          width: 100%;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
        }

        .timeline-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          transition: height 0.1s ease;
        }

        .timeline-slider:hover {
          height: 7px;
        }

        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--primary);
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .timeline-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .control-btn {
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .control-btn:hover {
          color: var(--primary);
          transform: scale(1.08);
        }

        /* Volume control styles */
        .volume-control-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-slider {
          -webkit-appearance: none;
          width: 70px;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }

        .time-display {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .time-divider {
          color: rgba(255,255,255,0.2);
        }

        /* Speed Control Panel */
        .speed-control-wrapper {
          position: relative;
        }

        .settings-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .speed-label-badge {
          font-size: 0.7rem;
          background: rgba(255,255,255,0.1);
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .rotate-icon {
          transform: rotate(45deg);
        }

        .speed-dropdown {
          position: absolute;
          bottom: 130%;
          right: 0;
          background: rgba(15, 16, 20, 0.95);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          width: 100px;
          box-shadow: var(--shadow-premium);
        }

        .speed-option {
          padding: 0.35rem 0.5rem;
          text-align: center;
          font-size: 0.8rem;
          border-radius: 4px;
          font-weight: 500;
          transition: var(--transition-smooth);
        }

        .speed-option:hover, .speed-option.active {
          background: var(--primary);
          color: #fff;
        }

        @media (max-width: 600px) {
          .player-bottom-controls {
            margin: 0.5rem;
            padding: 0.75rem;
          }
          .volume-slider {
            width: 45px;
          }
        }
      `}</style>
    </div>
  );
}
