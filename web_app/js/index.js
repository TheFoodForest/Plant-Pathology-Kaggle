const TestImageLoaderWorker = new Worker('/js/workers/image-loader.worker.js')
const testImgElements = document.querySelectorAll('img[data-src]')
const testImgPredictions = document.querySelectorAll('div.card-image')
const testCanvasDiv = document.querySelector('#canvas-div')
const testOutputs = document.querySelectorAll("span.card-content")

// We should attach the listener before we pass image URLs to the web worker
// to catch messages sent prior to the event being attached
TestImageLoaderWorker.addEventListener('message', event => {
    // Get the message data from the event
    const imageData = event.data

    // Select the original element for this image
    const imageElement = document.querySelectorAll(`img[data-src='${imageData.imageURL}']`)

    // We can use the `Blob` as an image source
    // We just need to convert it to an object URL first
    const objectURL = URL.createObjectURL(imageData.blob)

    // Once the image is loaded, cleanup memory
    imageElement.onload = () => {
        // Remove the original `data-src` attribute to make sure we don't
        // accidentally pass this image to the worker again in the future
        imageElement.removeAttribute('data-src')

        // Also revoke the object URL now that it's been used to cleanup
        URL.revokeObjectURL(objectURL)
    }
    imageElement[0].setAttribute('src', objectURL)
})

testImgElements.forEach(imageElement => {
    const imageURL = imageElement.getAttribute('data-src')
    TestImageLoaderWorker.postMessage(imageURL)
})


// Prediction button logic
// onclick draw img to hidden canvas and then get ImageData to pass to TensorFlow

testImgPredictions.forEach(item => {

    const imgEl = item.querySelector('img')
    const spanEl = item.querySelector('span')
    const btnEl = item.querySelector('a')

    btnEl.addEventListener('click', event => {

        // get image src and draw to hidden canvas then get ImageData and pass that to prediction functions, 
        testCanvasDiv.innerHTML += '<canvas id="hidden-canvas" width="256" height="256" hidden></canvas>';
        const testCanvas = document.querySelector('#hidden-canvas')
        const ctx = testCanvas.getContext("2d");

        const image = new Image;
        image.src = imgEl.getAttribute('data-src')
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
            imageData = ctx.getImageData(0, 0, 256, 256);
            // console.log(imageData);

            // pass imageDATA to TensorFlow here
            predict(imageData, spanEl)
        }

        // erase canvas to conserve memory
        testCanvasDiv.innerHTML = null

    })
})

// MaterializeCSS functions

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});