// determine height, width given target aspect ratio
// and max width, max height
const computeDimensions = ({
    aspectRatio, // ratio of width : height
    maxWidth,
    maxHeight,
}) => {
    // either we'll occupy full width or full height
    // W, H, r
    // ans -> parameterized by w :  w, rw
    // w <= W
    // rw <= H => w <= H/r
    // find larget w that satisfies these conditions
    // w_ans = min (W, H/r)
    const width = Math.min(maxWidth, maxHeight / aspectRatio);
    const height = aspectRatio * width;
    return {
        width, height
    };
}

export default computeDimensions;
