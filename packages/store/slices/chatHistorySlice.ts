import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type ChatBlock = {
    user: string;
    finance_gpt: string;
}

interface ChatState {
    allChats: ChatBlock[];
    isAnimateLastChat: boolean;
    currentMessage: string;
}

const initialState: ChatState = {
    allChats: [],
    isAnimateLastChat: false,
    currentMessage: ""
}

export const chatHistorySlice = createSlice({
    name: "chatHistory",
    initialState,
    reducers: {
        setAllChats: (state,action:PayloadAction<ChatBlock[]>) => {
            state.allChats = action.payload;
        },
        addChat: (state,action:PayloadAction<ChatBlock>) =>{
            state.allChats.push(action.payload);
        },
        removeLastChat: (state) => {
            state.allChats.pop();
        },
        setAnimateLastChat: (state, action:PayloadAction<boolean>) => {
            state.isAnimateLastChat = action.payload;
        },
        setCurrentMessage: (state, action:PayloadAction<string>) => {
            state.currentMessage = action.payload;
        }
    }
});

export const { setAllChats, addChat, removeLastChat, setAnimateLastChat,setCurrentMessage } = chatHistorySlice.actions;
export default chatHistorySlice.reducer;
export type { ChatBlock, ChatState };