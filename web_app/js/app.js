/*
    model.js
*/
// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;


function chanNorm(image) {
    console.log(`In chanNorm: ${image}`)
        // image = tf.Tensor.array(image).map((imgArr) => {
        //     console.log(imgArr)
        // })
    return image
}


function decodeImage(bits) {
    console.log(`In decode; ${bits}`);
    image = tf.browser.fromPixels(bits);
    image = tf.cast(image, 'float32') / 255;
    // image = tf.image.resizeBilinear(image, [256, 256]);
    image = chanNorm(image);
    return image
}

const predict = async(image, output) => {
    if (!model) model = await tf.loadLayersModel('/model/model.json');
    console.log(`In predict: ${image}`)
        // const processedImage = decodeImage(img)

    // shape has to be the same as it was for training of the model
    const prediction = model.predict(decodeImage(image)); // tf.reshape(decodeImage(image), shape = [1, 28, 28, 1])
    const label = prediction.argMax(axis = 1).get([0]);
    const accuracy = prediction.argMax(axis = 1).get([1]); // idk if this is how we get the accuracy but i'm hopeful
    renderImageLabel(label, accuracy, output);
    // })
};

function renderImageLabel(label, accuracy, output) {
    output.innerHTML += `<h4>${label}, with a ${accuracy * 100}%.</h4>`;
};