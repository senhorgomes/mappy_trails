$(() => {



  let likeBtn = document.querySelector('.ico');
  likeBtn.addEventListener('click', function () {
    likeBtn.classList.toggle('liked');
    $.ajax({
      method: "GET",
      url: window.location.href.split('/').filter(e => e !== '?').join("/") + "/favorites/"
    }).done(() => {
    })
  })

  $('#unfavorite').click(function (evt) {
    const favemapId = row.data("mapid")
    $.ajax({
      method: "POST",
      url: "/maps/" + favemapId + "/favorites/"
    })
  });

});
