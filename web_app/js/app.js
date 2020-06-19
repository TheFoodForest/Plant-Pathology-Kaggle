/*
    model.js
*/
// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;


// function chanNorm(image) {
//     console.log(`In chanNorm: ${image}`)
//         // image = tf.Tensor.array(image).map((imgArr) => {
//         //     console.log(imgArr)
//         // })
//     return image
// }


function decodeImage(imageData) {
    imageTensor = tf.browser.fromPixels(imageData);
    console.log(`In decode: ${imageTensor}`);
    // image = tf.cast(image, 'float32') / 255;
    // imgValues = imageTensor.arraySync();
    // console.log(`imgValues: ${imgValues}`);
    // imgArray = Array.from(imgValues);
    // console.log(`imgArray: ${imgArray}`);
    // imageTensor = tf.image.resizeBilinear(imageTensor, [256, 256]);
    // imageTensor = chanNorm(imageTensor);
    imageTensor = imageTensor.expandDims(0, 256, 256, 3)
    return imageTensor
}

/*

def decode_image(filename, label=None, image_size=(512, 512)):
    bits = tf.io.read_file(filename)
    image = tf.image.decode_jpeg(bits, channels=3)
    image = tf.cast(image, tf.float64)
    image = image / 255.0
    image = np.array(img).astype('float64')
    image[:,:,2] -= blue_mean 
    image[:,:,1] -= green_mean 
    image[:,:,0] -= red_mean 
    image = tf.cast(image, tf.float32)
    # image = image - means
    image = tf.image.resize(image, image_size)
    if label is None:
        return image
    else:
        return image, label

*/

function translateLabelOutput(prediction) {
    // take prediction Tensor and return label as string
}


const predict = async(image, output) => {
    if (!model) model = await tf.loadLayersModel('/model/model.json');
    console.log(`In predict: ${image}`)
        // const processedImage = decodeImage(img)

    // shape has to be the same as it was for training of the model
    const prediction = model.predict(decodeImage(image), batchSize = 1, verbose = true); // tf.reshape(decodeImage(image), shape = [1, 28, 28, 1])
    const label = prediction.argMax(axis = 1).print();
    const accuracy = prediction.argMax(axis = -1).print(); // idk if this is how we get the accuracy but i'm hopeful
    renderImageLabel(label, accuracy, output);
    // })
};

function renderImageLabel(label, accuracy, output) {
    output.innerHTML = null
    output.innerHTML += `<h4>${label}, with a ${accuracy * 100}% accuracy.</h4>`;
};