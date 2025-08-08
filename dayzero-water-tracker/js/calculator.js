// Initialize global variables
var total_percent = 0;
var bar_subtotal = 0;

// Handle scroll-based shrinking of header and usage-wrapper
window.addEventListener('scroll', function () {
  const header = document.querySelector('.header');
  const usage = document.querySelector('.usage-wrapper');

  // If scrolled more than 100px, apply shrink classes
  if (window.scrollY > 100) {
    header.classList.add('shrink');
    usage.classList.add('shrink');
  } else {
    // Otherwise, remove shrink classes
    header.classList.remove('shrink');
    usage.classList.remove('shrink');
  }
});

// Calculate total water usage and update UI
function calculate_water(){
  var total_usage = 0;

  // Sum all values from .bar-total-litres-value inputs
  $('.bar-total-litres-value').each(function(){
    total_usage = total_usage + parseFloat($(this).val());
  });

  // Convert total usage to percentage width for usage bar
  usage_bar_width = total_usage / 200 * 100;

  // Update usage bar color based on thresholds
  if (total_usage > 50){
    $('#usage-bar').css('background-color', '#499bf5');
  }
  if (total_usage > 80){
    $('#usage-bar').css('background-color', '#20b68c');
  }
  if (total_usage > 110){
    $('#usage-bar').css('background-color', '#a3b616');
  }
  if (total_usage > 160) {
    $('#usage-bar').css('background-color', '#d6ba4c');
  }
  if (total_usage >= 200){
    $('#usage-bar').css('background-color', '#ff7a00');
  }

  // Cap usage bar width at 100%
  if (usage_bar_width > 100){
    usage_bar_width = 100;
  }

  // Animate usage bar width
  $('#usage-bar').stop().animate({
    width: usage_bar_width + '%'}, 800
  );

  // Calculate average usage per person
  averageusage = total_usage / $('#household-number').val();

  // Update average display and usage bar label
  $('.average').text('Average: ' + averageusage + ' \u2113' + ' per person');
  $('#usage-bar').text(parseInt(total_usage) + ' \u2113');

  // Clear usage bar label if usage is negligible
  if (total_usage < 1){
    $('#usage-bar').text('');
  }
};

$(document).ready(function(){

  // Legacy scroll logic for shrinking header (redundant with above)
  $(function(){
    var shrinkHeader = 100;
    $(window).scroll(function() {
      var scroll = getCurrentScroll();
      if (scroll >= shrinkHeader) {
        $('.header').addClass('shrink');
        $('.usage-wrapper').addClass('usage-wrapper-shrink');
      } else {
        $('.header').removeClass('shrink');
        $('.usage-wrapper').removeClass('usage-wrapper-shrink');
      }
    });

    // Helper to get scroll position
    function getCurrentScroll() {
      return window.pageYOffset || document.documentElement.scrollTop;
    }
  });

  // Initialize jQuery UI slider for household count
  $(function() {
    $("#household-slider").slider({
      range: "max",
      min: 1,
      max: 10,
      value: 2,
      slide: function(event, ui) {
        $("#household-number").val(ui.value);
      }
    });

    // Set initial value
    $("#household-number").val($("#household-slider").slider("value"));
  });

  // Handle clicks on bar buttons (e.g. rinse, running tap)
  $('a.bar-button').on('click', function(button){
    console.log("bar button triggered");

    bar_type = $(this).data('type');
    button.preventDefault();
    water_value = $(this).data('value');
    prev_water_value = null;

    // Remove active state from all buttons of same type
    $('a.bar-button[data-type="'+$(this).data('type')+'"]').each(function(){
      if ($(this).hasClass('active')) {
        prev_water_value = $(this).data('value');
      }
      $(this).removeClass('active');

      // Update total litres value for this bar
      $('#' + bar_type + '-total-litres-value').val(water_value - prev_water_value + ' \u2113');
      calculate_water();
    });

    // If value changed, apply active state and recalculate
    if (prev_water_value != water_value){
      if ($('#' + bar_type + '-total')){
        console.log('cicle total exists, multiplying');
        water_value = water_value * ($('#' + bar_type + '-total')).val();
        console.log(water_value);
      }

      $('#' + bar_type + '-total-litres-value').val(water_value + ' \u2113');
      $(this).addClass('active');
      calculate_water();
    }
  });

  // Handle clicks on count buttons (+ / –)
  $('.countbutton').on('click', function(circlebutton){
    circlebutton.preventDefault();
    bar_type = $(this).attr("data-type");
    circle_total = $('#' + bar_type + '-total').val();
    buttonval = null;

    // Increment or decrement total
    if ($(this).attr('id') == 'addition'){
      circle_total++;
      calculate_water();
    }
    if ($(this).attr('id') == 'subtract'){
      circle_total--;
      calculate_water();
    }

    // Get active button value for this bar type
    if ($('a.bar-button[data-type="'+$(this).data('type')+'"]')){
      $('a.bar-button[data-type="'+$(this).data('type')+'"]').each(function(){
        if ($(this).hasClass('active')) {
          buttonval = $(this).data('value');
        }
      });
    }

        // if ($(this).attr('data-value')){
    //   $('#' + bar_type + '-total-litres-value').val((circle_total * $(this).attr('data-value')).toFixed(1) + ' \u2113');
    // }

    // Update total if count is valid
    if (circle_total >= 0){
      $('#' + bar_type + '-total').val(circle_total);

      // Calculate litres based on button value or fallback
      if ($(this).attr('data-value') && !buttonval){
        $('#' + bar_type + '-total-litres-value').val(circle_total * $(this).attr('data-value') + ' \u2113');
      } else {
        $('#' + bar_type + '-total-litres-value').val(circle_total * buttonval + ' \u2113');
      }

      calculate_water();
    }

    // If count drops below 1, deactivate buttons
    if (circle_total < 1){
      $('a.bar-button[data-type="'+$(this).data('type')+'"]').each(function(){
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
          calculate_water();
        }
      });
    }
  });
});
