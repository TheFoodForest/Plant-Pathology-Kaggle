const testOutputs = document.querySelectorAll("span.card-content")
const TestImageLoaderWorker = new Worker('/workers/image-loader.worker.js')
const testImgElements = document.querySelectorAll('img[data-src]')


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


// MaterializeCSS functions

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});