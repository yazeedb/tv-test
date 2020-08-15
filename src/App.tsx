import React, { FC, useReducer } from 'react';
import { VideoWithProgress } from './data';
import './App.scss';
import { reducer, initialState, actions } from './state';

const App: FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const totalTime = calculateTotalTime(state.videos);

  return (
    <main className="app">
      <section className="list-section">
        <header>
          <h1>ThankView Walkthrough</h1>
          <h4 className="total-time">Total: {formatTime(totalTime)}</h4>
        </header>

        <ul className="videos">
          {state.videos.map((v, index) => {
            const order = `${(index + 1).toString().padStart(2, '0')}.`;
            const selected = v.url === state.selectedVideo.url;

            return (
              <li
                className={selected ? 'video selected' : 'video'}
                onClick={() => dispatch(actions.selectVideo(v))}
                key={v.url}
              >
                <span>{order}</span>
                <span className="video-title">{v.title}</span>

                <span className="spacer">-</span>

                <span className="progress">
                  {Math.min(
                    100,
                    Math.round((v.secondsWatched / v.totalSeconds) * 100)
                  )}
                  %
                </span>

                <p className="video-time">{formatTime(v.totalSeconds)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="video-section">
        <video
          src={state.selectedVideo.url}
          poster={state.selectedVideo.thumb}
          controls
          // TODO: Unmute when you're done
          muted
          autoPlay
          onLoadedData={(event) => {
            event.currentTarget.currentTime =
              state.selectedVideo.secondsWatched;
          }}
          onTimeUpdate={(event) => {
            dispatch(
              actions.setSecondsWatched(
                state.selectedVideo,
                event.currentTarget.currentTime
              )
            );
          }}
          onEnded={() => {
            const { selectedVideo, videos } = state;

            const videosAfter = videos.slice(selectedVideo.index + 1);
            const videosBefore = videos.slice(0, selectedVideo.index);

            const nextVideoToPlay = videosAfter
              .concat(videosBefore)
              .find(isNotComplete);

            if (nextVideoToPlay) {
              dispatch(actions.selectVideo(nextVideoToPlay));
            }
          }}
        />
      </section>
    </main>
  );
};

const isNotComplete = (video: VideoWithProgress) =>
  video.secondsWatched < video.totalSeconds;

const calculateTotalTime = (videos: VideoWithProgress[]) =>
  videos.reduce((total, v) => total + v.totalSeconds, 0);

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);

  return `${minutes}m ${seconds} s`;
};

export default App;
