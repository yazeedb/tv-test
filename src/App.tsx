import React, { FC, useReducer } from 'react';
import { mockData, VideoWithProgress } from './data';
import './App.scss';

interface State {
  videos: VideoWithProgress[];
  selectedVideo: VideoWithProgress;
}

const uiData: VideoWithProgress[] = mockData.map((v, index) => ({
  ...v,
  secondsWatched: 0,
  totalSeconds: v.minutes * 60 + v.seconds,
  index,
}));

const initialState: State = {
  videos: uiData,
  selectedVideo: uiData[0],
};

const actions = {
  selectVideo: (video: VideoWithProgress) => ({ type: 'SELECT_VIDEO', video }),

  setSecondsWatched: (video: VideoWithProgress, secondsWatched: number) => ({
    type: 'SET_ELAPSED_TIME',
    video,
    secondsWatched,
  }),
};

const reducer = (state = initialState, action: any): State => {
  switch (action.type) {
    case 'SELECT_VIDEO':
      return {
        ...state,
        selectedVideo: action.video,
      };

    case 'SET_ELAPSED_TIME': {
      const { video, secondsWatched } = action;

      return {
        ...state,
        videos: state.videos.map((v) => {
          if (v.url !== video.url) {
            return v;
          }

          return {
            ...v,
            secondsWatched: Math.max(v.secondsWatched, secondsWatched),
          };
        }),
      };
    }

    default:
      return state;
  }
};

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

            const nextIndex =
              selectedVideo.index === videos.length - 1
                ? 0
                : selectedVideo.index + 1;

            dispatch(actions.selectVideo(videos[nextIndex]));
          }}
        />
      </section>
    </main>
  );
};

const videoIsComplete = (video: VideoWithProgress) =>
  video.secondsWatched >= video.totalSeconds;

const calculateTotalTime = (videos: VideoWithProgress[]) =>
  videos.reduce((total, v) => total + v.totalSeconds, 0);

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);

  return `${minutes}m ${seconds} s`;
};

export default App;
