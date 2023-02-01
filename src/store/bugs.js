import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { apiCallBegan } from "./api";
import moment from 'moment';
import axios from "axios";

//Automatically create action types and action creators. 
const slice = createSlice({
    name: 'bugs',
    initialState: {
        list: [],
        loading:false,
        lastFetch: null,
    },
    reducers: {
        bugsRequested: (bugs, action) => {
            bugs.loading = true;
        },
        bugsReceived:(bugs, action) => {
            bugs.list = action.payload;
            bugs.loading = false;
            bugs.lastFetch = Date.now();
        },
        bugsRequestFailed:(bugs, actions) => {
            bugs.loading = false;
        },
        bugAssignedToUser: (bugs, action ) => {
            const {id: bugId, userId } = action.payload;
            const index = bugs.list.findIndex(bug => bug.id === bugId);
            bugs.list[index].userId = userId;
        },
        //map actions to action handlers
        bugAdded: (bugs, action) =>{
            bugs.list.push(action.payload);
        },
        bugResolved: (bugs, action) => {
            const index = bugs.list.findIndex(bug => bug.id === action.payload.id)
            bugs.list[index].resolved = true
        },
        bugRemoved: (bugs, action ) => {
            bugs.filter(bug => bug.id !== action.payload.id);
        },
    }
});

export const {
    bugAdded, 
    bugResolved, 
    bugRemoved, 
    bugAssignedToUser, 
    bugsReceived,
    bugsRequested,
    bugsRequestFailed,
} = slice.actions;

export default slice.reducer;

//Action Creators
export const url = "/bugs" //store in config file.

export const loadBugs = () => (dispatch, getState) => {
    const {lastFetch} = getState().entities.bugs;
    const diffInMinutes = moment().diff(moment(lastFetch), 'minutes');
    if (diffInMinutes < 10) return;
    return dispatch(
        apiCallBegan({
            url,
            onStart: bugsRequested.type,
            onSuccess: bugsReceived.type,
            onError: bugsRequestFailed.type,
        })
    );
}

// export const addBug = bug => async (dispatch) => {
//     const response = await axios.request({
//         baseURL: 'http://localhost:9001/api',
//         url: '/bugs',
//         method: 'post',
//         data: bug
//     });
//     dispatch(bugAdded(response.data));
// }


export const addBug = bug => 
    apiCallBegan({
        url, 
        method: 'post',
        data: bug,
        onSuccess: bugAdded.type,
    });

export const resolveBug = id => 
    apiCallBegan({
        // /bugs/:id
        url: url+'/'+id,
        method: 'patch',
        data: {resolved: true},
        onSuccess: bugResolved.type,
    });
export const assignBugToUser = (bugId, userId) => 
    apiCallBegan({
        url: url+'/'+bugId,
        method: 'patch',
        data: { userId },
        onSuccess: bugAssignedToUser.type
    });

//selector function
// export const getUnresolvedBugs = state => 
//     state.entities.bugs.filter(bug => !bug.resolved);

//Memoization
//Return result from cache if bugs and projects is unchanged. 
export const getUnresolvedBugs = createSelector(
    state => state.entities.bugs,
    state => state.entities.projects,
    (bugs, projects) => bugs.list.filter(bug => !bug.resolved)
)

export const getBugsByUser = userId => createSelector(
    state => state.entities.bugs,
    bugs => bugs.list.filter(bug => bug.userId === userId)
)