/*
    model.js
*/
let model;

tf.enableProdMode(); // hopefully will help with phone bugs


console.log(tf.getBackend());
// migth use this function to change the memory management when on a phone

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };


  const mobile = window.mobileCheck()



function chanNorm(image) {
    return tf.tidy(() => {
    const means = tf.tensor3d([
        [
            [0.4043033271154857, 0.5134412407909822, 0.3131933874018047]
        ]
    ]);
    // image.print();
    image = tf.sub(image, means);
    // console.log('MEMORY IN chanNorm');
    // console.log(tf.memory());
    // image.print();
    return image
    })
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
    return tf.tidy(() => {
    // console.log(`imageData: ${imageData}`);
    imageTensor = tf.browser.fromPixels(imageData);

    const imgScalar = tf.scalar(255);
    // console.log(imgScalar);
    imageTensor = imageTensor.div(imgScalar);
    // console.log(`In decode: ${imageTensor}`);
    imageTensor = tf.image.resizeBilinear(imageTensor, [256, 256]); // Needed for resize but HTML canvas tag is controlling size currently
    imageTensor = chanNorm(imageTensor);
    imageTensor = imageTensor.expandDims(); // 0, 256, 256, 3

    // console.log('MEMORY IN decodeImage');
    // console.log(tf.memory());
    return imageTensor
    })
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
            height:150
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
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
                ['']
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
        label = "Rust and Scab";
    } else if (prediction === 2) {
        label = "Rust";
    } else if (prediction === 3) {
        label = "Scab";
    }
    return label
};

const predict = async(image, output, index) => {
    
    tf.engine().startScope();
    
    if (!model) {model = await tf.loadLayersModel('model/model.json');}

    // console.log('MODEL')
    // console.log(tf.memory());
    // model.summary();
    // console.log(`In predict: ${image}`);
    var processedImage = decodeImage(image);
    // console.log('processedImage')
    // console.log(tf.memory());
    

    // shape has to be the same as it was for training of the model
    var prediction = model.predict(processedImage, verbose = false, {batchSize:1});
    // console.log('prediction')
    // console.log(tf.memory());
    
    var pred = prediction.arraySync()[0];
    // console.log('pred')
    // console.log(tf.memory());

    // console.log(`In predict: ${prediction.max().arraySync()}`);
    // prediction.print();
    var certainty = prediction.max().arraySync();
    // console.log('certainty')
    // console.log(tf.memory());
    // console.log(certainty);
    prediction = prediction.argMax(axis = 1).arraySync()[0];
    // console.log('prediction')
    // console.log(tf.memory());
    // console.log(prediction);
    var label = translateLabelOutput(prediction);
    // console.log('label')
    // console.log(tf.memory());
    renderImageLabel(label, certainty, output, pred, index);
    if (loadDiv) {
        loadDiv.classList.remove('loading-overlay');
        loadDiv.innerHTML = null;
    }
    // console.log('renderImageLabel')
    // console.log(tf.memory());



    if(mobile) {
        mem = Object(memory());
        relyable = mem.unreliable;
        tens = mem.numTensors;
        buffers = mem.numDataBuffers;
        bytes = mem.numBytes;
        bytesGPU = mem.numBytesInGPU;
        ;
        alert(`Note for Mobile Debug: \nBytes: ${bytes}\nUnreliable : ${relyable} \nTensors : ${tens}\nBuffers :${buffers}\nGpuBytes : ${bytesGPU}`)
    }
    tf.engine().endScope();



    // console.log('############### OUT SCOPE ###############')
    // console.log(tf.memory());
    return label 
};


const memory = () => {return tf.memory()};