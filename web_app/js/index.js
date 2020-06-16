const testOutputs = document.querySelectorAll("span.card-content")
const TestImageLoaderWorker = new Worker('/js/workers/image-loader.worker.js')
const testImgElements = document.querySelectorAll('img[data-src]')
const testImgPredictButtons = document.querySelectorAll('a.btn-floating')
const testCanvasDiv = document.querySelector('#canvas-div')


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

testImgPredictButtons.forEach(item => {
    item.addEventListener('click', event => {
        // get img data-src by getting img element by ID using the name of the button
        const imgEl = document.getElementsByName(item.id);
        // get image src and draw to hidden canvas then get ImageData and pass that to prediction functions, 
        testCanvasDiv.innerHTML += '<canvas id="hidden-canvas" width="256" height="256" hidden></canvas>';
        const testCanvas = document.querySelector('#hidden-canvas')
        const ctx = testCanvas.getContext("2d");

        const image = new Image;
        image.src = imgEl[0].getAttribute('data-src')
        image.onload = () => {
                ctx.drawImage(image, 0, 0);
                imageData = ctx.getImageData(0, 0, 256, 256);
                console.log(imageData);
            }
            // pass imageDATA to TensorFlow here

        // erase canvas to conserve memory
        testCanvasDiv.innerHTML = ''

    })
})

// MaterializeCSS functions

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});