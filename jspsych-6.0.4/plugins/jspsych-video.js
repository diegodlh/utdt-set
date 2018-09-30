/* jspsych-video.js
 * Josh de Leeuw
 *
 * This plugin displays a video. The trial ends when the video finishes.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins.video = (function() {

  var plugin = {};

  plugin.info = {
    name: 'video',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Sources',
        array: true,
        default: undefined,
        description: 'The video file to play.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: undefined,
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: undefined,
        description: 'The height of the video display in pixels.'
      },
      autoplay: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Autoplay',
        default: true,
        description: 'If true, the video will begin playing as soon as it has loaded.'
      },
      controls: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Controls',
        default: false,
        description: 'If true, the subject will be able to pause the video or move the playback to any point in the video.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the video content.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      stop: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stop',
        default: null,
        description: 'Time to stop the clip.'
      },
      uid: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'User ID',
        default: '',
        description: 'Zero-padded user ID to print on screen.'
      },
      max_views: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Maximum number of views.',
        default: 1,
        description: 'Maximum number of views before proceeding automatically.'
      },
      key_forward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key forward',
        default: 'rightarrow',
        description: 'The key the subject can press in order to end the trial.'
      },
      key_backward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key backward',
        default: 'leftarrow',
        description: 'The key that the subject can press to play the video again.'
      }
    }
  }


  plugin.trial = function(display_element, trial) {

    var view_history = [];
    var start_time = (new Date()).getTime();

    // display stimulus
    var video_html = '<video id="jspsych-video-player" width="'+trial.width+'" height="'+trial.height+'" '
    if(trial.autoplay){
      video_html += "autoplay "
    }
    if(trial.controls){
      video_html +="controls "
    }
    video_html+=">"
    for(var i=0; i<trial.sources.length; i++){
      var s = trial.sources[i];
      if(s.indexOf('?') > -1){
        s = s.substring(0, s.indexOf('?'));
      }
      var type = s.substr(s.lastIndexOf('.') + 1);
      type = type.toLowerCase();

      // adding start stop parameters if specified
      video_html+='<source src="'+trial.sources[i]

      /*
      // this isn't implemented yet in all browsers, but when it is
      // revert to this way of doing it.

      if (trial.start !== null) {
        video_html+= '#t=' + trial.start;
      } else {
        video_html+= '#t=0';
      }

      if (trial.stop !== null) {
        video_html+= ',' + trial.stop
      }*/

      video_html+='" type="video/'+type+'">';
    }
    video_html +="</video>"

    //show prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    video_html += `
      <img id="video-next" src="images/next.png" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:10%;visibility:hidden" />
      <img id="video-back" src="instructions/leftkey.png" style="position:absolute;left:0;bottom:0;visibility:hidden">
      <p style="position:absolute;top:0;right:10px;margin:0;font-size:2.5vh;line-height:normal">${trial.uid}</p>
    `;

    display_element.innerHTML = video_html;

    var views = 0;
    display_element.querySelector('#jspsych-video-player').onended = function(){
      if (views == trial.max_views) {
        end_trial();
      } else {
        document.getElementById('video-next').style.visibility = 'visible';
        document.getElementById('video-back').style.visibility = 'visible';
        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: end_trial,
          valid_responses: [trial.key_forward],
        });
        listener_backward = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: function() {
            document.getElementById('video-back').style.visibility = 'hidden';
            jsPsych.pluginAPI.cancelKeyboardResponse(listener_backward);
            display_element.querySelector('#jspsych-video-player').currentTime = 0;
            display_element.querySelector('#jspsych-video-player').play();
          },
          valid_responses: [trial.key_backward],
        });
      }
    }

    // event handler to set timeout to end trial if video is stopped
    display_element.querySelector('#jspsych-video-player').onplay = function(){
      if (display_element.querySelector('#jspsych-video-player').currentTime == 0) {
        views += 1;
        view_history.push((new Date()).getTime());
      };
      if(trial.stop !== null){
        if(trial.start == null){
          trial.start = 0;
        }
        jsPsych.pluginAPI.setTimeout(end_trial, (trial.stop-trial.start)*1000);
      }
    }

    if(trial.start !== null){
      display_element.querySelector('#jspsych-video-player').currentTime = trial.start;
    }

    // function to end trial when it is time
    var end_trial = function() {

      jsPsych.pluginAPI.cancelAllKeyboardResponses()

      // gather the data to store for the trial
      var trial_data = {
        "view_history": JSON.stringify(view_history),
        "rt": (new Date()).getTime() - start_time
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var after_response = function(info) {
      if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_backward)) {

        if (current_page !== 0 && trial.allow_backward) {
          back();
        }
      }

      if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_forward)) {
        next();
      }


    }

  };

  return plugin;
})();
