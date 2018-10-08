// sources
// https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

const recordAudio = record => {  // this is a function with promise functionality, because it returns a promise

  return new Promise((resolve, reject) => {  // executor function to which the *resolve* function argument is passed

    var onSuccess = function(stream) {
      const mediaRecorder = new MediaRecorder(stream);  // , {mimeType: ''});
      console.log('mediaRecorder mimeType is ' + mediaRecorder.mimeType);
      const audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        };
      });

      const start = () => {
        if (mediaRecorder.state != 'recording') {
          mediaRecorder.start();
        };
        console.log(mediaRecorder.state);
      };

      const stop = () => {  // stop returns a promise whose resolution value is blob, url and play method of audio recorded
        return new Promise(resolve => {
          mediaRecorder.addEventListener("stop", () => {  // not sure why this was set as a listener
            const audioBlob = new Blob(audioChunks);  // , { 'type' : '' });
            const audioUrl = URL.createObjectURL(audioBlob);
            // const audio = new Audio(audioUrl);
            // const play = () => {
            //   audio.play();
            // };
            const download = (filename) => {
              var a = document.createElement('a');
              a.href = audioUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            };

            resolve({ audioBlob, audioUrl, download });  // promise fullfilled, resolution value
          });

          if (mediaRecorder.state != 'inactive') {
            mediaRecorder.stop();
          }
          console.log(mediaRecorder.state)
          stream.getTracks().forEach(track => { track.stop() });
        });
      };

      if (record) {
        resolve({ start, stop });  // resolution value of promise returned by recordAudio
      } else {
        stop();
        reject('Recording authorized, but not requested.');
      }
    };

    var onError = function(err) {
      console.log('The following getUserMedia error occured: ' + err);
      reject('The following getUserMedia error occured: ' + err);  // rejected, failure reason of promise returned by recordAudio
    };
  
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.mediaDevices.getUserMedia({ audio: true })  // returns a Promise that resolves to a MediaStream object
      
      // Success callback
      .then(onSuccess)  // this is the function called if the getUserMedia promise is fullfilled; it is called with the *stream* argument, which is the fullfillment value of the getUserMedia promise

      // Error callback
      .catch(onError)
    } else {
      console.log('getUserMedia not supported on your browser!');
      reject('getUserMedia not supported on your browser!');  // rejected, failure reason of promise returned by recordAudio
    };
  });
};