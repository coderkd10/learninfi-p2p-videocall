// my simple implementation of a cacelable promise

export const CANCELED_PROMISE_EXCEPTION_NAME = "CanceledPromiseException";

const generateCanceledPromiseException = () => {
    const e = new Error("this promise was canceled");
    e.name = CANCELED_PROMISE_EXCEPTION_NAME;
    return e;
}

// this function takes a promise and makes it cancelable
// i.e attaches a `cancel` method to it
// if the cancel method is not called the returned promise
// behaves like the original promise
// but after the cancel 
const cancelifyPromise = origPromise => {
    let resolveFn;
    let rejectFn;
    const newPromise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });
    newPromise.cancel = () => {
        // somehow cancel the promise
        rejectFn(generateCanceledPromiseException());
    }
    origPromise
        .then(v => {
            resolveFn(v);
        })
        .catch(e => {
            rejectFn(e);
        })
    return newPromise;
}

export default cancelifyPromise;
