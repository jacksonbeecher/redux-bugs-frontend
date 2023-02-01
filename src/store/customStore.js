import reducer from "./reducer";

function createStore(reducer) {
    let state;
    let listeners = [];

    function getState() {
        return state;
    }

    function subscribe(listener) {
        listeners.push(listener);
    }

    function dispatch(action){
        //Call reducer to get new state
        state = reducer(state, action);
        //Notify subscribers. 
        for (let i = 0; i < listeners.length; i++){
            listeners[i]();
        }
    }

    return {
        subscribe,
        dispatch,
        getState
    };
}

export default createStore(reducer);