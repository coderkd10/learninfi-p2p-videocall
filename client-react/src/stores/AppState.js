import { observable } from 'mobx';
import { create, persist } from 'mobx-persist';

class AppState {
    @persist @observable showAutoplayErrorDialog = true;
    
    @persist @observable captureAudio = true;
    @persist @observable captureVideo = true;
};

const appState = new AppState();
const hydrate = create();

hydrate('vcapp_2', appState).then(() => console.log('hydrated app state'));

export default appState;
