$(window).scroll(function () {
    $('.scroll-move1,.scroll-move2,.scroll-move3').each(function (i, obj) {
		var athis = $(this);
		if(isScrolledIntoView(athis) && !isanimated(athis)){
			 $(this).addClass("scroll-visit");
		}
    });
});
$(document).ready(function () {
    $('.scroll-move1,.scroll-move2,.scroll-move3').each(function (i, obj) {
		var athis = $(this);
		if(isScrolledIntoView(athis) && !isanimated(athis)){
			 $(this).addClass("scroll-visit");
		}
    });
});

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height() / 2;
    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
function isanimated(obj){
	if(obj.attr("animated")==="true"){
		return true;
	}else{
		return false;
	}
}

//scroll and button animation
