/*
    model.js
*/
let model;


function chanNorm(image) {
    const means = tf.tensor3d([
        [
            [0.4043033271154857, 0.5134412407909822, 0.3131933874018047]
        ]
    ]);
    image.print();
    image = tf.sub(image, means);
    image.print();
    return image
}


function decodeImage(imageData) {
    imageTensor = tf.browser.fromPixels(imageData);
    const imgScalar = tf.scalar(255);
    imageTensor = imageTensor.div(imgScalar);
    // console.log(`In decode: ${imageTensor}`);
    imageTensor = tf.image.resizeBilinear(imageTensor, [256, 256]); // Needed for resize but HTML canvas tag is controlling size currently
    imageTensor = chanNorm(imageTensor);
    imageTensor = imageTensor.expandDims(); // 0, 256, 256, 3
    return imageTensor
}

/*

Python Function to refactor

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


function renderImageLabel(label, certainty = 0, output) {
    certainty = Math.round(certainty * 100);
    output.innerHTML = null;
    output.innerHTML += `<h5>${label}, with a ${certainty}% certainty.</h5>`;
};

function translateLabelOutput(prediction) {
    // take prediction Tensor and return label as string
    // console.log(prediction);
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
    var certainty = prediction.max().arraySync(); // idk if this is how we get the certainty but i'm hopeful
    // console.log(`In predict: ${prediction.max().arraySync()}`);
    // prediction.print();
    prediction = prediction.argMax(axis = 1).arraySync()[0];
    // console.log(prediction);
    var label = translateLabelOutput(prediction);
    // console.log(certainty);
    renderImageLabel(label, certainty, output);
};