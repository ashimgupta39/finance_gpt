import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type triggerType = {
    triggerName: string;
    triggerValue: Boolean;
}
const fileFetchRefreshTriggerInitialState:triggerType = {
    triggerName: "",
    triggerValue: false
};

export const fileFetchRefreshSlice = createSlice({
    name: "fileFetchRefreshTrigger",  
    initialState: fileFetchRefreshTriggerInitialState,
    reducers: {
        setFileFetchRefreshTrigger: (state, action:PayloadAction<Boolean>) => {
            state.triggerValue = action.payload;
        }
    }
});

export const { setFileFetchRefreshTrigger } = fileFetchRefreshSlice.actions;
export default fileFetchRefreshSlice.reducer;
export type { triggerType };