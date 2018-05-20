// todo: publish this as a standalone npm module
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
    let cbs = null; // reference to new promise's callbacks
    const newPromise = new Promise((resolve, reject) => {
        cbs = {
            resolve,
            reject
        };
    });
    newPromise.cancel = () => {
        // ensure that the new promise is rejected
        // with the correct name set
        cbs && cbs.reject(generateCanceledPromiseException());
        cbs = null;
    }
    origPromise
        .then(v => {
            cbs && cbs.resolve(v);
            cbs = null;
        })
        .catch(e => {
            cbs && cbs.reject(e);
            cbs = null;
        })
    return newPromise;
}

export default cancelifyPromise;
