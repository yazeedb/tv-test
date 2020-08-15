import { mockData, VideoWithProgress } from './data';

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

export const initialState: State = {
  videos: uiData,
  selectedVideo: uiData[0],
};

export const actions = {
  selectVideo: (video: VideoWithProgress) => ({ type: 'SELECT_VIDEO', video }),

  setSecondsWatched: (video: VideoWithProgress, secondsWatched: number) => ({
    type: 'SET_ELAPSED_TIME',
    video,
    secondsWatched,
  }),
};

export const reducer = (state = initialState, action: any): State => {
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
