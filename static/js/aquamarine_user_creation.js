$("#password").on("input change paste keyup", checkPasswordMatches);
$("#confirmPassword").on("input change paste keyup", checkPasswordMatches);

function load_welcome_page(hide, display) {
    $("#page-" + hide.toString()).hide()
    $("#page-" + display.toString()).show();
}

function checkPasswordMatches() {
    if ($("#password").val() == $("#confirmPassword").val() && $("#password").val() != "") $("#submit2").removeAttr("disabled");
    else $("#submit2").attr("disabled", "disabled");
}