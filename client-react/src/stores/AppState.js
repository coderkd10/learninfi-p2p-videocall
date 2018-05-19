import { observable } from 'mobx';
import { create, persist } from 'mobx-persist';

class AppState {
    @persist @observable showAutoplayErrorDialog = true;
};

const appState = new AppState();
const hydrate = create();

hydrate('vcapp_1', appState).then(() => console.log('hydrated app state'));

export default appState;
