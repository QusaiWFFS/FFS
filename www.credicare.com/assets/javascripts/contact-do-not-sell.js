$(document).ready(function() {
	var iframe = document.getElementById('reCaptchaIframe');
	iframe.onload = function() {
		console.log('Captcha iframe loaded...');
	};

	$("#contactForm").validate({
								   rules: {
									   fname: "required",
									   lname: "required",
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
									   agree1: "required",
									   agree2: "required",
									   'g-recaptcha-response': "required",
								   },
								   // form error message (notify your visitor about their mistake)
								   messages: {
									   fname: "Please enter your first name",
									   lname: "Please enter your first name",
									   phone: {
										   required: "Please enter a valid phone number",
										   digits: "Only numbers allowed 0-9",
										   minlength: "Phone number should be 10 numbers",
										   maxlength: "Phone number should be 10 numbers",
									   },
									   email: "Please enter a valid email address",
									   agree1: "Please accept the agreement",
									   agree2: "Please accept the authorization",
									   'g-recaptcha-response': "reCaptcha is not checked",
								   },
								   errorPlacement: function(error, element) {
									   if((element[0].id == 'agree1') || (element[0].id == 'agree2'))
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
																	})
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
			showCaptchaError();
		}
		if (data.message == 'captchaResponse' && data.input) {
			$message = "<input type=\'hidden\' name=\'g-recaptcha-response\' value=\'\" + token + \"\'>";
			$('#contactForm input[name="g-recaptcha-response"]').remove();
			$('#contactForm').prepend("<input type=\'hidden\' name=\'g-recaptcha-response\' value=\'" + data.input + "\'>");
		}
		if (data.message == 'sizeChange' && data.amount) {
			iframe.style.height = data.amount + "px";
			if ($('#reCaptchaIframe').css('transform') != null) {
				//If the iframe has a transform on it we need to accomodate for that
				var element = document.getElementById('reCaptchaIframe');
				var scaleX = element.getBoundingClientRect().width / element.offsetWidth;
				$('.submit-button').css('margin-top', (scaleX * data.amount) + "px");
			} else {
				$('.submit-button').css('margin-top', data.amount + "px");
			}
		}
		return;
	}

	function showCaptchaError() {
		$('#capMessage').html('Error with CAPTCHA.');
		$('#capMessage').show();
		$.modal.close();
		console.log("Error receiving message from the Captcha iframe.");
	}

});