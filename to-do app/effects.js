// effects.js
$(function(){
  // animate the input when a task is added
  $("#taskInput").on("taskAdded", function() {
    $(this).fadeOut(100).fadeIn(200);
  });

  // show a brief visual when a task is toggled
  $(document).on("taskToggled", function(ev, text, done){
    var msg = done ? "Completed: " + text : "Marked incomplete: " + text;
    // small temporary message element
    var $m = $("<div/>").text(msg).css({
      position: "fixed",
      right: 20,
      bottom: 20,
      background: "#222",
      color: "#fff",
      padding: "8px 12px",
      "border-radius": "8px",
      "z-index": 9999,
      opacity: 0
    }).appendTo("body");
    $m.animate({opacity:1, bottom:40}, 200).delay(900).animate({opacity:0, bottom:20}, 300, function(){ $m.remove(); });
  });

  // removal toast
  $(document).on("taskRemoved", function(ev, text){
    var $m = $("<div/>").text("Removed: " + text).css({
      position: "fixed",
      right: 20,
      bottom: 20,
      background: "#b71c1c",
      color: "#fff",
      padding: "8px 12px",
      "border-radius": "8px",
      "z-index": 9999,
      opacity: 0
    }).appendTo("body");
    $m.animate({opacity:1, bottom:40}, 200).delay(800).animate({opacity:0, bottom:20}, 300, function(){ $m.remove(); });
  });

  $(document).on("tasksCleared", function(){
    var $m = $("<div/>").text("All tasks cleared").css({
      position: "fixed",
      right: 20,
      bottom: 20,
      background: "#333",
      color: "#fff",
      padding: "8px 12px",
      "border-radius": "8px",
      "z-index": 9999,
      opacity: 0
    }).appendTo("body");
    $m.animate({opacity:1, bottom:40}, 200).delay(900).animate({opacity:0, bottom:20}, 300, function(){ $m.remove(); });
  });
});