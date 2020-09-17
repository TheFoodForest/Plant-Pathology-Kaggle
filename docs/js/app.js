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
    // image.print();
    image = tf.sub(image, means);
    // image.print();
    return image
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

// Prepare jpeg image for TensorFlow
function decodeImage(imageData) {
    // console.log(`imageData: ${imageData}`);
    imageTensor = tf.browser.fromPixels(imageData);
    // console.log(`imageTensor: ${imageTensor}`);
    const imgScalar = tf.scalar(255);
    // console.log(imgScalar);
    imageTensor = imageTensor.div(imgScalar);
    // console.log(`In decode: ${imageTensor}`);
    imageTensor = tf.image.resizeBilinear(imageTensor, [256, 256]); // Needed for resize but HTML canvas tag is controlling size currently
    imageTensor = chanNorm(imageTensor);
    imageTensor = imageTensor.expandDims(); // 0, 256, 256, 3
    return imageTensor
}




function renderImageLabel(label, certainty = 0, output, pred, index) {

    certainty = Math.round(certainty * 1000)/10;
    output.innerHTML = null;
    output.innerHTML += `<p>${label}, with a ${certainty}% certainty.</p>
                        <div>
                        <figure class="highcharts-figure">
                            <div id="container-${index}" class='container-chart'></div>
                        </figure>
                        </div>`;

    
    
 
    pred = pred.map(d => Math.round(d * 10000) / 100);
    
    var chartOptions =  {
        chart: {
            type: 'column',
        },
        title: {
            text: 'Prediction Certainty'
        },
        subtitle: {
            text: 'This chart shows how certain the model is in it\'s prediction'
        },
        accessibility: {
            description: 'Chart shows that the number of distinct clients receiving services has consistenly increased since 2015.'
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },


        xAxis: {
            categories: [
                ['Predictions']
            ],
            // crosshair: true
        },
        yAxis: {
            min: 0,
            max: 105,
            endOnTick: false,
            title: {
                text: '',
                // rotation: 0,
                // y: 0
            }
        },
        credits: {
            enabled: true
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0; text-align:right"><b>{point.y}%</b></td></tr>',

            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Healthy',
            data: [pred[0]]
    
        }, {
            name: 'Multiple',
            data: [pred[1]]
    
        }, {
            name: 'Rust',
            data: [pred[2]]
    
        },
        {
            name: 'Scab',
            data: [pred[3]]
    
        }],
        colors: ["#434348","#7cb5ec",  "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],
    };


    Highcharts.chart(`container-${index}`, chartOptions);
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

const predict = async(image, output, index) => {

    if (!model) model = await tf.loadLayersModel('model/model.json');
    // model.summary();
    // console.log(`In predict: ${image}`);
    var processedImage = decodeImage(image);

    // shape has to be the same as it was for training of the model
    var prediction = model.predict(processedImage, verbose = true);
    var pred = prediction.arraySync()[0];
    // console.log(`In predict: ${prediction.max().arraySync()}`);
    // prediction.print();
    var certainty = prediction.max().arraySync();
    // console.log(certainty);
    prediction = prediction.argMax(axis = 1).arraySync()[0];
    // console.log(prediction);
    var label = translateLabelOutput(prediction);
    renderImageLabel(label, certainty, output, pred, index);
    if (loadDiv) {
        loadDiv.classList.remove('loading-overlay');
        loadDiv.innerHTML = null;
    }
};