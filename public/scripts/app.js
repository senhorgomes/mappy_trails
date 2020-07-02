$(() => {
  // $.ajax({
  //   method: "GET",
  //   url: "/api/users"
  // }).done((users) => {
  //   for(user of users) {
  //     $("<div>").text(user.name).appendTo($("body"));
  //   }
  // });;
  let likeBtn = document.querySelector('.ico');
  likeBtn.addEventListener('click', function () {
    likeBtn.classList.toggle('liked');
    $.ajax({
      method: "GET",
      url: window.location.href.split('/').filter(e=> e !=='?').join("/")+"/favorites/"
    }).done(()=>{
    })
  })

  setTimeout(function () {
   $('#fav-text-indicator').css('visibility', 'hidden')
  }, 5000);
  
});

