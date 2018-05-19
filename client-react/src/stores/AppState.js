import { observable } from 'mobx';

class AppState {
    @observable n = 0;
};

export default new AppState();
