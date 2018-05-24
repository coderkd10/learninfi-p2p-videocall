const removeArrayIndex = (array, i) => {
    if (i < 0 || i >= array.length) {
        return array;
    }
    return [...array.slice(0, i), ...array.slice(i+1)]    
}

const removeInArray = (array, element) =>
    removeArrayIndex(array, array.indexOf(element));


module.exports = {
    removeInArray
};
