import {configureStore} from '@reduxjs/toolkit';
import chatReducer  from './slices/chatSlice';
import fileFetchRefreshSlice from './slices/filesFetchTriggers';
import chatHistorySlice from './slices/chatHistorySlice';

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        fileFetchRefreshTrigger: fileFetchRefreshSlice,
        chatHistory: chatHistorySlice
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;