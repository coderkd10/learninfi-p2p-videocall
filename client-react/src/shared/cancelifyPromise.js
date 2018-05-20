// todo: publish this as a standalone npm module
// my implementation of a cancelable promise

export const CANCELED_PROMISE_EXCEPTION_NAME = "CanceledPromiseException";

const generateCanceledPromiseException = () => {
    const e = new Error("this promise was canceled");
    e.name = CANCELED_PROMISE_EXCEPTION_NAME;
    return e;
}

// this function takes a promise and makes it cancelable
// i.e attaches a `cancel` method to the returned promise.
// until the cancel method is not called the returned promise
// behaves just like the original promise (its then / catch
// handlers are triggered when the original's are triggered
// with the same inputs) but as soon as the cancel function is
// called the returned promise is rejected with an exception
// (which can be identified by its name -> "CanceledPromiseException")
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
