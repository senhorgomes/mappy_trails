$(() => {
  $('#new_point').hide()
  $('#new_map').on('submit', (evt) => {
    evt.preventDefault();
    console.log("ready");
    $.ajax("/maps/", {
      method: 'POST', data: $('form')
        .serialize()
    })
      .then((res) => {
        console.log(res);
        $('#new_point').slideDown('slow');
        $('#new_map button').hide();
        //$('new_point.children').empty()
      });
  });
  $('#new_point').on('submit', (evt) => {
    evt.preventDefault();
    console.log("ready");
    $.ajax("/maps/:mapId/points", {
      method: 'POST', data: $('form')
        .serialize()
    })
      .then((res) => {
        $('#new_point textarea').val("");
        $('#new_point input').val("");
        console.log(res);
      });
  });
});
