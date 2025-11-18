// exp1.js — Basic jQuery interactions
$(function() {
  // disable right-click
  $(document).on('contextmenu', function(e) {
    e.preventDefault();
  });

  // click image -> scroll to top
  $('#scrollTopImg').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  // hover paragraph -> make red
  $('#para1').on('mouseenter', function() {
    $(this).css('color', 'red');
  });

  // reset color
  $('#color-reset').on('click', function() {
    $('#para1').css('color', '');
  });

  // toggle message
  $('#toggleBtn').on('click', function() {
    $('#message').slideToggle(250);
  });
});
