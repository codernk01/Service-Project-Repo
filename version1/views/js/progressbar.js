$(".st1").click(function() {
    $(".profile").prop("checked", true);
})

$(".st2").click(function() {
    $(".settings").prop("checked", true);
})

$(".st3").click(function() {
    $(".posts").prop("checked", true);
})

$(".st4").click(function() {
    $(".books").prop("checked", true);
})

$("ul li").click(function() {
    $(this).addClass("active").siblings().removeClass("active");
})

$("form button").click(function(){
    $("ul li").addClass("active").siblings().removeClass("active");
})