$(() => {
  console.log("ready");
  $.ajax("/maps/", { method: 'POST', data: $('form')
  .serialize() })
  .then(() => {$('new_point.children').empty()
  });
});
