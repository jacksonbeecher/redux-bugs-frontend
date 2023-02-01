import React, {Component} from 'react';
import StoreContext from '../contexts/storeContext';
import { loadBugs } from '../store/bugs';

class Bugs extends Component {
    static contextType = StoreContext;
    state={bugs:[]};

    componentDidMount() {
        //subscribe to store
        const store = this.context;
        this.unsubscribe = store.subscribe(()=> {
            const bugsInStore = store.getState().entities.bugs.list;
            if (this.state.bugs !== bugsInStore) this.setState({ bugs: bugsInStore})
        });
        //dispatch(loadBugs)
        store.dispatch(loadBugs());

        //console.log(this.context);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return (
            <ul>
                {this.state.bugs.map((bug) => (
                    <li key = {bug.id}>{bug.description}</li>
                ))}
            </ul>
        );
    }
}

export default Bugs;