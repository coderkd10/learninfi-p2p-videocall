export const delay = timeInMs => (new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, timeInMs);
}));
