/* eslint-disable no-undef */
/* eslint-disable no-console */
const account = {
    name: 'quinn',
    sas: 'se=2019-06-01&sp=rwdlac&sv=2018-03-28&ss=b&srt=sco&sig=TzbhTXyTEQRmkcDN6zoHWgoVYRBDqdEaX2rmV0iTINA%3D',
};

const blobUri = `https://${account.name}.blob.core.windows.net`;
const blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, account.sas);

// Create container on Azure.
const createContainer = () => {
    document.getElementById('create-button').addEventListener('click', () => {
        blobService.createContainerIfNotExists('container', (err, container) => {
            if (err) {
                console.log('The following error occured when creating container: ', err);
            } else {
                console.log(`${container.name} already exists`);
                alert(`${container.name} already exists`);
            }
        });
    });
};

// Upload a blob file to Azure
const uploadBlob = () => {
    document.getElementById('upload-button').addEventListener('click', () => {
        /**
         * TODO: change file to fetch specific audio file on browser.
         */
        const file = document.getElementById('fileinput').files[0];

        blobService.createBlockFromBrowserFile(
            'container',
            (err,
            file.name,
            file,
            (err, result) => {
                if (err) {
                    console.log('The following error occured when uploading file: ', err);
                } else {
                    console.log(`Upload of ${file.name} successful.`);
                    alert(`Upload of ${file.name} successful.`);
                }
            })
        );
    });
};

// List blob files in container on Azure
const listBlob = () => {
    document.getElementById('list-button').addEventListener('click', () => {
        // eslint-disable-next-line no-unused-vars
        const blobs = document.getElementById('blobs');
        blobService.listBlobSegmented('container', null, (err, results) => {
            if (err) {
                console.log('The following error occured while fetching blob: ', err);
            } else {
                results.entries.forEach(blob => {
                    /**
                     * TODO: add blobs to web page, .blob section
                     */
                    console.log(blob.name);
                });
            }
        });
    });
};

// Delete Blob file on Azure
const deleteBlob = () => {
    document.getElementById('delete-button').addEventListener('click', () => {
        let blobName;
        blobService.deleteBlobIfExists('container', blobName, (err, result) => {
            if (err) {
                console.log('The following error occured while deleting blob: ', err);
            } else {
                console.log('Blob deleted successfully');
            }
        });
    });
};

// Record audio from browser
const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
        stream => {
            // create new instance of MediaRecorder() and pass stream as param to be captured
            const mediaRecorder = new MediaRecorder(stream);

            record.onclick = () => {
                mediaRecorder.start();
                console.log(`${mediaRecorder.state}, recorder started`);
                record.style.color = 'red';
            };

            /**
             * collect audio as recording progresses with
             * on mediaRecorder.ondataavailable event
             */
            const chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);

            // finalize blob for use
            stop.onclick = () => {
                mediaRecorder.stop();
                console.log(`${mediaRecorder.state}, recorder stopped`);
                record.style.color = '';
            };

            // grabbing and using blob
            mediaRecorder.onstop = () => {
                const clipName = prompt('Enter the name of your audio clip: ');

                const clipContainer = document.createElement('article');
                const clipLabel = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');
                const uploadButton = document.createElement('button');

                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');
                uploadButton.textContent = 'Upload';
                deleteButton.innerHTML = 'Delete';
                clipLabel.innerHTML = clipName;

                // clipContainer.setAttribute('class', 'row');
                uploadButton.setAttribute('id', 'upload-button');
                uploadButton.setAttribute('class', 'btn blue darken-1 right-align button');
                deleteButton.setAttribute('class', 'btn blue darken-1 right-align button');

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(uploadButton);
                clipContainer.appendChild(deleteButton);
                soundClips.appendChild(clipContainer);

                const blob = new Blob(chunks, {
                    type: 'audio/ogg, codecs=opus',
                });
                // eslint-disable-next-line no-const-assign
                chunks = [];
                const audioURL = URL.createObjectURL(blob);
                audio.src = audioURL;

                // delete audio element
                deleteButton.onclick = e => {
                    const eventTarget = e.target;
                    eventTarget.parentNode.parentNode.removeChild(eventTarget.parentNode);
                };

                // upload blob
                uploadButton.onclick = e => {
                    const eventTarget = e.target;
                    console.log(eventTarget);
                    // uploadBlob();
                };
            };
        },
        // error callback
        err => console.log(`The following getUserMedia error occured: ${err}`)
    );
} else {
    console.log('Sorry, getUserMedia not supported on your browser!');
    alert('Sorry, getUserMedia not supported on your browser...');
}
