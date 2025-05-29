import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type Chat = {
    id: number;
    company: string;
}

interface ChatState {
    selectedChat: Chat | null;
    allChats: Chat[];
}

const initialState: ChatState = {
    selectedChat: null,
    allChats: [],
}

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setAllChats: (state,action:PayloadAction<Chat[]>) => {
            state.allChats = action.payload;
        },
        setSelectedChat: (state, action:PayloadAction<Chat|null>) => {
                state.selectedChat = action.payload;
            
        },
        addChat: (state,action:PayloadAction<Chat>) =>{
            state.allChats.push(action.payload);
        },
        removeChat: (state, action:PayloadAction<number>) => {
            // remove the chat with the given id
            state.allChats = state.allChats.filter(chat => chat.id !== action.payload);
        }
    }
});

export const { setAllChats, setSelectedChat, addChat, removeChat } = chatSlice.actions;
export default chatSlice.reducer;
export type { Chat, ChatState };