const ImageLoaderWorker = new Worker('/workers/image-loader.worker.js')
const imgElements = document.querySelectorAll('img[data-src]')

// We should to attach the listener before we pass image URLs to the web worker
// to catch messages sent prior to the event being attached
ImageLoaderWorker.addEventListener('message', event => {
    // Grab the message data from the event
    const imageData = event.data

    // Get the original element for this image
    const imageElement = document.querySelectorAll(`img[data-src='${imageData.imageURL}']`)

    // We can use the `Blob` as an image source! We just need to convert it
    // to an object URL first
    const objectURL = URL.createObjectURL(imageData.blob)

    // Once the image is loaded, we'll want to do some extra cleanup
    imageElement.onload = () => {
        // Let's remove the original `data-src` attribute to make sure we don't
        // accidentally pass this image to the worker again in the future
        imageElement.removeAttribute('data-src')

        // We'll also revoke the object URL now that it's been used to prevent the
        // browser from maintaining unnecessary references
        URL.revokeObjectURL(objectURL)
    }
    imageElement[0].setAttribute('src', objectURL)
})

imgElements.forEach(imageElement => {
    const imageURL = imageElement.getAttribute('data-src')
    ImageLoaderWorker.postMessage(imageURL)
})