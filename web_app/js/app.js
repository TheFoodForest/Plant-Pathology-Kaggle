/*
    model.js
*/
// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;


function chanNorm(image) {
    console.log(`In chanNorm: ${image}`)
        // imageTensor = tf.cast(imageTensor, 'float32') / 255;
    return image
}


function decodeImage(imageData) {
    imageTensor = tf.browser.fromPixels(imageData);
    console.log(`In decode: ${imageTensor}`);
    // imageTensor = tf.image.resizeBilinear(imageTensor, [256, 256]); // Needed for resize but HTML canvas tag is controlling size currently
    imageTensor = chanNorm(imageTensor);
    imageTensor = imageTensor.expandDims(); // 0, 256, 256, 3
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


function renderImageLabel(label, accuracy = 0, output) {
    output.innerHTML = null;
    output.innerHTML += `<h4>${label}, with a ${accuracy * 100}% accuracy.</h4>`;
};

function translateLabelOutput(prediction) {
    // take prediction Tensor and return label as string
    console.log(prediction);
    var label;
    if (prediction === 0) {
        label = "Healthy";
    } else if (prediction === 1) {
        label = "Rust with Scab";
    } else if (prediction === 2) {
        label = "Rust";
    } else if (prediction === 3) {
        label = "Scab";
    }
    return label
};

const predict = async(image, output) => {
    if (!model) model = await tf.loadLayersModel('/model/model.json');
    // model.summary();
    // console.log(`In predict: ${image}`);
    var processedImage = decodeImage(image);

    // shape has to be the same as it was for training of the model
    var prediction = model.predict(processedImage, verbose = true);
    var label = translateLabelOutput(prediction.argMax(axis = 1).arraySync()[0]);
    console.log(label);
    var accuracy = prediction[prediction.argMax(axis = 1)]; // idk if this is how we get the accuracy but i'm hopeful
    renderImageLabel(label, accuracy, output);
};