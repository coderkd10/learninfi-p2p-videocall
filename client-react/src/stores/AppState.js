import { observable } from 'mobx';
import { create, persist } from 'mobx-persist';

class AppState {
    @persist @observable showAutoplayErrorDialog = true;
    
    @persist @observable captureAudio = true;
    @persist @observable captureVideo = true;
};

const appState = new AppState();
const hydrate = create();

export const appReady = hydrate('vcapp_2', appState)
    .then(() => console.log('hydrated app state'))
    .catch(e => {
        console.log('some error occured while hydrating appState: ', e);
        // todo: log this error to backend
        // and then maybe remove this console log
    })

export default appState;
