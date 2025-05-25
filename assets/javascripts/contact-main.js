$(document).ready(function() {
	var iframe = document.getElementById('reCaptchaIframe');
	if (iframe) {
		iframe.onload = function() {
			console.log('Captcha iframe loaded...');
		};
	}

	// debt_amount
	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style:                 'currency',
		currency:              'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
	$("#debt_amount").on('change', function() {$("#debt_amount_display").html(currencyFormatter.format(this.value));});
	$("#debt_amount").on('input', function() {$("#debt_amount_display").html(currencyFormatter.format(this.value));});

	/**  >Only runs on Chromium<
	 *  Chromium does not have a webkit for handling the progress range like mozilla's "-moz-range-progress"
	 *  We will have to redefine the webkit CSS to handle individual browsers
	 *  **/
	// if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
		$('.chrome input').on('input change', function () {
			const value = (this.value - this.min) / (this.max - this.min) * 100;
			$(this).css('background', 'linear-gradient(to right, #00a651 ' + value + '%, #fff ' + value + '%)');
			$(this).css('border-radius', '0.5rem');
			$(this).css('height', '.60rem');
		});
		$('#debt_amount').change();
	// };

	// state TODO
	// if (window.navigator.geolocation) {
	// 	window.navigator.geolocation.getCurrentPosition(console.log, setStateVal(false));
	// }
	// function setStateVal(val)
	// {
	// 	if(!val) return;
	// }

	$("#contactForm").validate({
								   rules: {
									   fullname: "required",
									   phone: {
										   required: true,
										   digits: true,
										   minlength: 10,
										   maxlength: 10,
									   },
									   email: {
										   required: true,
										   email: true
									   },
									   debt_amount: "required",
									   state: "required",
									   agree: "required",
									   'g-recaptcha-response': "required",
								   },
								   // form error message (notify your visitor about their mistake)
								   messages: {
									   fullname: "Please enter your name",
									   phone: {
										   required: "Please enter a valid phone number",
										   digits: "Only numbers allowed 0-9",
										   minlength: "Phone number should be 10 numbers",
										   maxlength: "Phone number should be 10 numbers",
									   },
									   email: "Please enter a valid email address",
									   debt_amount: "Please select an amount",
									   state: "Please select your state",
									   agree: "Please accept the terms of use",
									   'g-recaptcha-response': "reCaptcha is not checked",
								   },
								   errorPlacement: function(error, element) {
									   if(element[0].id == 'agree')
									   {
										   element = element.parent().parent();
									   }
									   var newelement = element.next('.help-block');
									   newelement.html(error);
								   },
								   submitHandler: function() {
									   $(':input[type="submit"]').prop('disabled', true);
									   $('#loading-overlay').show();
									   let formData = new FormData($('#contactForm')[0]);
									   $.ajax({
												  url: "assets/email/send.php",
												  type: "POST",
												  dataType: 'json',
												  data: formData,
												  contentType: false,
												  cache: false,
												  processData: false,
												  success: function(result) {
													  console.log(result);
													  if (result.success) {
														  Swal.fire({
																		title: 'Success!',
																		text: result.message,
																		icon: 'success',
																		confirmButtonText: 'Thank You'
																	});
														  // $("#contactForm")[0].reset();
														  $("#contactForm").html("<p>" + result.message + "</p>");
													  } else {
														  Swal.fire({
																		title: 'Error!',
																		text: result.message,
																		icon: 'error',
																		confirmButtonText: 'Okay'
																	});
													  }
													  $('#loading-overlay').hide();
													  $(':input[type="submit"]').prop('disabled', false);
												  },
												  error: function(msg) {
													  console.log('error', msg);
													  $('#loading-overlay').hide();
													  $(':input[type="submit"]').prop('disabled', false);
													  Swal.fire({
																	title: 'Error!',
																	text: 'Oops! An error occurred, please try again later.',
																	icon: 'error',
																	confirmButtonText: 'Okay'
																});
												  }
											  });
								   }
							   });

	$('.floating-input, .floating-select, .ctminpt').on('focusout', function() {
		$(this).valid();
	});

	//Get postmessage from Captcha iframe
	window.addEventListener("message", captchaResponse, false);

	function captchaResponse(event) {
		var data = new Object();
		try {
			data = JSON.parse(event.data);
		} catch (e) {
			return; // Silently fail if we can't parse the message
		}
		
		var iframe = document.getElementById('reCaptchaIframe');
		if (!iframe) return; // Exit if iframe doesn't exist

		if (data.message == 'captchaResponse' && data.input) {
			$message = "<input type='hidden' name='g-recaptcha-response' value='" + data.input + "'>";
			$('#contactForm input[name="g-recaptcha-response"]').remove();
			$('#contactForm').prepend($message);
		}
		if (data.message == 'sizeChange' && data.amount && iframe) {
			iframe.style.height = data.amount + "px";
			if ($('#reCaptchaIframe').css('transform') != null) {
				var scaleX = iframe.getBoundingClientRect().width / iframe.offsetWidth;
				$('.submit-button').css('margin-top', (scaleX * data.amount) + "px");
			} else {
				$('.submit-button').css('margin-top', data.amount + "px");
			}
		}
	}

	function showCaptchaError() {
		$('#capMessage').html('Error with CAPTCHA.');
		$('#capMessage').show();
		$.modal.close();
		console.log("Error receiving message from the Captcha iframe.");
	}

	let step = 1;
	function formStep(direction = 1) {
		if(
			(step == 1 && $('#debt_amount').val() > 0) // can't proceed unless value set
			|| (step == 2 && $('#state').val() !== 'N/A') // can't proceed unless value set
			|| direction == -1) // go back 1 step
		{
			step += direction;
		}

		switch(step)
		{
			case 1:
				$('#form_back_button1').hide();
				$('#form_next_div').show();
				$('#form_step1').show();
				$('#form_step2').hide();
				$('#form_step3').hide();
				break;
			case 2:
				$('#form_back_button1').show();
				$('#form_next_div').show();
				$('#form_step1').hide();
				$('#form_step2').show();
				$('#form_step3').hide();
				break;
			case 3:
				$('#form_back_button1').show();
				$('#form_next_div').hide();
				$('#form_step1').hide();
				$('#form_step2').hide();
				$('#form_step3').show();
				break;
			default:
				$('#form_back_button2').hide();
				$('#form_next_div').hide();
				$('#form_step1').show();
				$('#form_step2').show();
				$('#form_step3').show();
		}
	}

	$('#form_back_button1').click(function() { formStep(-1); });
	$('#form_back_button2').click(function() { formStep(-1); });
	$('#form_next_button').click(function() { formStep(1); });
	formStep(0);

});