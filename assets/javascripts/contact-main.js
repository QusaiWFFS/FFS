console.log('DEBUG: contact-main.js file is loaded and parsed.');

$(document).ready(function() {
	console.log('DEBUG: jQuery document is ready.');

	$("#contactForm").on('submit', function(event) {
		event.preventDefault(); // Crucial: Prevent default form submission
		console.log('Form submission intercepted! Default prevented.');
		
		// For now, we will just log and not send AJAX request
		// This is to confirm preventDefault is working.

		// Swal.fire({
		// 		title: 'Intercepted!',
		// 		text: 'Form submission was intercepted by JavaScript.',
		// 		icon: 'info',
		// 		confirmButtonText: 'Okay'
		// 	});

		// Temporarily disable the rest of the form logic
		$(':input[type="submit"]').prop('disabled', true);
		$('#loading-overlay').show();

		// Your AJAX call logic would go here once preventDefault is confirmed

		// Example of re-enabling button and hiding overlay (commented out for now)
		// $(this).find(':input[type="submit"]').prop('disabled', false);
		// $('#loading-overlay').hide();

		let formData = new FormData($(this)[0]);
		let jsonData = {};
		for (let pair of formData.entries()) {
			jsonData[pair[0]] = pair[1];
		}

		// Map form data to CRM fields
		let crmData = {
			Email: jsonData.email,
			Fname: jsonData.firstName,
			Lname: jsonData.lastName,
			Message: jsonData.message,
			'Phone#': jsonData.phone,
			State: jsonData.state,
			Total_Unsecured_Debt: jsonData.debt_amount,
		};

		$.ajax({
			url: "https://6ohn342ti7.execute-api.eu-north-1.amazonaws.com/v1/form-submission",
			type: "POST",
			dataType: 'text', // Changed to text to inspect raw response
			data: crmData,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8", // Changed to standard form encoding
			cache: false,
			processData: true, // Process data for standard form encoding
			success: function(result) {
				console.log('Raw CRM Response:', result);
				let parsedResult;
				try {
					parsedResult = JSON.parse(result);
				} catch (e) {
					console.log('Could not parse CRM response as JSON, treating as text success.');
					// If it's not JSON, but we got a response, assume success for now
					parsedResult = { success: true, message: 'Form submitted successfully (raw response received).' };
				}

				if (parsedResult.success) {
					Swal.fire({
						title: 'Success!',
						text: parsedResult.message || 'Your message has been sent successfully.',
						icon: 'success',
						confirmButtonText: 'Thank You'
					});
					$("#contactForm")[0].reset();
				} else {
					Swal.fire({
						title: 'Error!',
						text: parsedResult.message || 'There was an issue with your submission.',
						icon: 'error',
						confirmButtonText: 'Okay'
					});
				}
				$('#loading-overlay').hide();
				$(':input[type="submit"]').prop('disabled', false);
			},
			error: function(msg) {
				console.log('AJAX error', msg);
				$('#loading-overlay').hide();
				$(':input[type="submit"]').prop('disabled', false);
				Swal.fire({
					title: 'Error!',
					text: 'Oops! An error occurred during the request. Please try again later.',
					icon: 'error',
					confirmButtonText: 'Okay'
				});
			}
		});
	});


	// The rest of the original script content (like debt slider, inactivity modal, formStep) 
	// is being commented out for this test to minimize interference.

	// Original debt_amount logic (commented out)
	/*
	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style:                 'currency',
		currency:              'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
	$("#debt_amount").on('change', function() {$("#debt_amount_display").html(currencyFormatter.format(this.value));});
	$("#debt_amount").on('input', function() {$("#debt_amount_display").html(currencyFormatter.format(this.value));});
	*/

	// Original Chromium range progress (commented out)
	/*
	$('.chrome input').on('input change', function () {
		const value = (this.value - this.min) / (this.max - this.min) * 100;
		$(this).css('background', 'linear-gradient(to right, #00a651 ' + value + '%, #fff ' + value + '%)');
		$(this).css('border-radius', '0.5rem');
		$(this).css('height', '.60rem');
	});
	$('#debt_amount').change();
	*/

	// Original state TODO (commented out)
	/*
	// if (window.navigator.geolocation) {
	// 	window.navigator.geolocation.getCurrentPosition(console.log, setStateVal(false));
	// }
	// function setStateVal(val)
	// {
	// 	if(!val) return;
	// }
	*/

	// Original Captcha iframe handling (commented out)
	/*
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
	*/

	// Original inactivityModal and timer (commented out)
	/*
	function inactivityModal() {
		Swal.fire({
			title: '<h1 class="swal2-title" style="	margin-top: 0;padding-top: 0;">Still there?</h1><br/>Give us a call at <u style="text-wrap: nowrap;">(888) 915-4090</u> to see how we can help!',
			icon: 'question',
			width: 'fit-content',
			html: `<div class="container">
				<div class="row">
					<div class="col-lg-12">
						<div class="content ps-0" data-aos="fade-left">
							<ul class="bbb-ul">
						<li>
									<i class="bi bi-check-circle-fill"></i>
							<span>FREE consultation</span>
						</li>
						<li>
									<i class="bi bi-check-circle-fill"></i>
							<span>NO upfront enrollment fees and no obligation</span>
						</li>
						<li>
									<i class="bi bi-check-circle-fill"></i>
							<span>FREE savings estimates</span>
						</li>
						<li>
									<i class="bi bi-check-circle-fill"></i>
							<span>Get out of debt without bankruptcy</span>
						</li>
					</ul>
				</div>
			</div>
				</div>
			</div>`,
			showConfirmButton: false,
			showCloseButton: true,
			showCancelButton: false,
			focusConfirm: false
		})

		document.removeEventListener("mousemove", resetTimer);
		document.removeEventListener("keydown", resetTimer);
		document.removeEventListener("mousedown", resetTimer);
		document.removeEventListener("touchstart", resetTimer);
	}

	let inactivityTimer;

	function resetTimer() {
		clearTimeout(inactivityTimer);
		inactivityTimer = setTimeout(inactivityModal, 120 * 1000);
	}

	document.addEventListener("mousemove", resetTimer);
	document.addEventListener("keydown", resetTimer);
	document.addEventListener("mousedown", resetTimer);
	document.addEventListener("touchstart", resetTimer);
	*/

	// Original anchor scroll (commented out)
	/*
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			}
		});
	});
	*/

	// Original formStep logic (commented out)
	/*
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
	*/

});