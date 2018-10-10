/*
 * Example plugin template
 */

jsPsych.plugins["report_confidence"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "report_confidence",
    description: '',
    parameters: {
      canvas_size:{
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Canvas size',
        default: ['800','700'],
        description: 'Size of canvas'
      },
      points_to_pass:{
        type: jsPsych.plugins.parameterType.INT,
        default: 10,
        description: 'Number of points necesary to pass level'
      },
      points:{
        type: jsPsych.plugins.parameterType.INT,
        default: 0,
        description: 'Accumulated points'
      },
      won:{
        type: jsPsych.plugins.parameterType.BOOL,
        description: 'Has chosen the biggest circle'
      },
      time_post_response:{
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 1,
        description: "waiting time after response (in seconds), showing points awarded"
      }
    }
  }

  plugin.trial = function(display_element, trial) {

  var canvas_size=trial.canvas_size;
  var level=trial.level;
  var points=trial.points;
  var points_to_pass=trial.points_to_pass;
  var won=trial.won;
  var finished_drawing=false;

  var trial_data={
    key_press:[],
    trial_score:[],
    accum_score:[],
    confident:[],
    rt:[]
  };

  display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  cursor:crosshair; ' ;></canvas>"+
  "<button type='submit' id='tick' ><img src='images/green-tick.png'alt='Submit'></button>"+
  "<button type='submit' id='cross' ><img src='images/red-cross.png'alt='Submit'></button>";

  var canvas = document.getElementById('myCanvas'),
      canvas_rect = canvas.getBoundingClientRect(),
      ctx = canvas.getContext("2d");
  var score_section={width:(canvas.width-canvas.height), height: Math.round(canvas.height)};  // left side of the canvas is assigned to display score

  var tick_button=document.getElementById("tick");
      // BUTTON PROPERTIES
      //button.innerHTML="SIGUIENTE";
      tick_button.style.position = "fixed";
      tick_button.style.top = String(canvas_rect.bottom*0.8)+'px'
      tick_button.style.left= String(canvas_rect.left + score_section.width + (canvas.width-score_section.width)*0.33)+'px'
      display_element.querySelector('#tick').disabled=false;
      display_element.querySelector('#tick').addEventListener('click', function(){
        display_element.querySelector('#tick').disabled=true;
        display_element.querySelector('#cross').disabled=true;
        trial_data.rt=Date.now()-start_time;
        trial_data.confident=true;
        if(won){
          points=points+3;
          trial_data.trial_score=3;
        }else{
          trial_data.trial_score=-3;
          points=points-3;
        };
        trial_data.accum_score=Math.max(0,points);
        draw_score(points)
        setTimeout(end_trial, 1000)
      });

  var cross_button=document.getElementById("cross");
      // BUTTON PROPERTIES
      //button.innerHTML="SIGUIENTE";
      cross_button.style.position = "fixed";
      cross_button.style.top = String(canvas_rect.bottom*0.8)+'px'
      cross_button.style.left= String(canvas_rect.left + score_section.width + (canvas.width-score_section.width)*0.66)+'px'
      display_element.querySelector('#cross').disabled=false;
      display_element.querySelector('#cross').addEventListener('click', function(){
        display_element.querySelector('#cross').disabled=true;
        display_element.querySelector('#tick').disabled=true;
        points=points+1;
        trial_data.rt=Date.now()-start_time;
        trial_data.confident=false;
        trial_data.trial_score=1;
        trial_data.accum_score=points;
        draw_score(points);
        setTimeout(end_trial, 1000)
      });



  ctx.clearRect(0,0,canvas.width,canvas.height);

  draw_score(points)
  var start_time=Date.now();

  function draw_score(points){
    finished_drawing=false;
    var pointsize=score_section.height*0.62/points_to_pass*0.25;
    var delta_y=score_section.height*0.62/points_to_pass;
    for(var i=0;i<Math.min(points,points_to_pass);i++){
      x=score_section.width*0.33;
      y=score_section.height-(i+1)*delta_y;
      ctx.beginPath(); //Start path
      ctx.fillStyle = "red"; //  color
      ctx.arc(x, y, pointsize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
      ctx.fill(); // Close the path and fill.
      ctx.closePath();
    }
    for(var i=Math.max(0,points);i<points_to_pass;i++){
      x=score_section.width*0.33;
      y=score_section.height-(i+1)*delta_y;
      ctx.beginPath(); //Start path
      ctx.fillStyle = "grey"; //  color
      ctx.arc(x, y, pointsize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
      ctx.fill(); // Close the path and fill.
      ctx.closePath();
    }
    finished_drawing=true;
  }





  // store response
  var response = {
    rt: null,
    key: null
  };


  // function to end trial when it is time
  var end_trial = function() {
    // kill any remaining setTimeout handlers
    jsPsych.pluginAPI.clearAllTimeouts();
    // kill keyboard listeners
    if (typeof keyboardListener !== 'undefined') {
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
    }
    // clear the display
    display_element.innerHTML = '';
    trial_data.key_press=response.key;

    //disable all socket calls
    //jsPsych.node.socket.off();

    // move on to the next trial
    jsPsych.finishTrial(trial_data);
  };


  // function to handle responses by the subject
  var after_response = function(info) {

    // after a valid response, the stimulus will have the CSS class 'responded'
    // which can be used to provide visual feedback that a response was recorded

    // only record the first response
    if (response.key == null) {
      response = info;
    }

    if (trial.response_ends_trial) {
      end_trial();
    }
  };



  // start the response listener
  if (trial.choices != jsPsych.NO_KEYS) {
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });
  }



  };

  return plugin;
})();
