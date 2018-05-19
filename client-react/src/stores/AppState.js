import { observable } from 'mobx';

class AppState {
    @observable showAutoplayErrorDialog = true;
};

export default new AppState();
