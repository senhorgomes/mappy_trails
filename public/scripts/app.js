$(() => {



  let likeBtn = document.querySelector('.ico');
  likeBtn.addEventListener('click', function () {
    likeBtn.classList.toggle('liked');
    $.ajax({
      method: "GET",
      url: window.location.href.split('/').filter(e=> e !=='?').join("/")+"/favorites/"
    }).done(()=>{
    })
  })

  $('#unfavorite').addEventListener('click',function(evt){
    evt.preventDefault();
    const favemapId = row.data("mapid")
    $.ajax({
      method: "POST",
      url: "/maps/"+favemapId+"/favorites/"
    })
  });

  setTimeout(function () {
   $('#fav-text-indicator').css('visibility', 'hidden')
  }, 5000);
  
});

