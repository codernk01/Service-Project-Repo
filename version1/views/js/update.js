const tabBtn = document.querySelectorAll(".tab");
const tab = document.querySelectorAll(".tabShow");

function tabs(pannelIndex){
    tab.forEach(function(node){
        node.style.display = "none";
    });
    tab[pannelIndex].style.display = "block";
}
tabs(0);

$(".tab").click(function(){
    $(this).addClass("active").siblings().removeClass("active");
})