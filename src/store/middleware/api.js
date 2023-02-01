import axios from "axios";
import * as actions from "../api";

const api = ({ dispatch }) => next => async action => {
    if (action.type !== actions.apiCallBegan.type) return next(action);

    const {url, method, data, onStart, onSuccess, onError} = action.payload

    if (onStart) dispatch({ type:onStart});

    next(action);

    try {
        const response = await axios.request({
            baseURL: 'http://localhost:9001/api',
            url, // /bugs
            method,
            data,
        });
        //General success
        dispatch(actions.apiCallSuccess(response.data));
        //Specific success
        if (onSuccess) dispatch({type: onSuccess, payload: response.data});
    } catch(error) {
        //General
        dispatch(actions.apiCallFailed(error.message));
        //Specific senarios.
        if (onError) dispatch({type: onError, payload: error.message});
    }
};

export default api;