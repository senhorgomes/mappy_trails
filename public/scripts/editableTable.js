const $tableID = $('#table');
const $BTN = $('#export-btn');
const $EXPORT = $('#export');

const newTr = `
 <tr>
 <td class="pt-3-half" contenteditable="true"></td>
 <td class="pt-3-half" contenteditable="true"></td>
 <td class="pt-3-half" contenteditable="true"></td>
 <td class="pt-3-half" contenteditable="true"></td>
 <td>
   <span class="table-remove"><button type="button"
       class="btn btn-danger btn-rounded btn-sm my-0">Remove</button></span>
 </td>
</tr>`;

$('.table-add').click(() => {

  $('tbody').append(newTr);
});
// $(document).ready(() => {
//   $('.save').click((evt) => {
//     const data = {};
//     console.log(this, evt.target)
//     $(this).parents('tr').find('td').each(() => {
//       const tableCell = $(this)
//       console.log(tableCell);

//       const valueName = $(tableCell).find("input").attr("name")
//       const value = $(tableCell).text()
//       data[valueName] = value;
//     })
//     console.log(data);

//   });
// });
$(document).on('click', 'button.save', function () {
  const data = {};
  console.log($(this)[0])
  const row = $(this).parents('tr')
  data.pointId = row.data("pointid")
  data.mapId = row.data("mapid")

  row.find('td').each(function () {
    const tableCell = $(this)
    console.log(tableCell);

    const valueName = $(tableCell).find("input").attr("name")
    const value = $(tableCell).text();
    if (valueName) {
      data[valueName] = value;
    }
  })
  $.ajax({
    method: "POST",
    url: "/maps/" + data.mapId + "/edit/"+data.pointId +"/",
    data: data
  })

});

$tableID.on('click', '.table-remove', function () {

  $(this).parents('tr').detach();
});

$tableID.on('click', '.table-up', function () {

  const $row = $(this).parents('tr');

  if ($row.index() === 0) {
    return;
  }

  $row.prev().before($row.get(0));
});

$tableID.on('click', '.table-down', function () {

  const $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.on('click', () => {

  const $rows = $tableID.find('tr:not(:hidden)');
  const headers = [];
  const data = [];

  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {

    headers.push($(this).text().toLowerCase());
  });

  // Turn all existing rows into a loopable array
  $rows.each(function () {
    const $td = $(this).find('td');
    const h = {};

    // Use the headers from earlier to name our hash keys
    headers.forEach((header, i) => {

      h[header] = $td.eq(i).text();
    });

    data.push(h);
  });

  // Output the result
  $EXPORT.text(JSON.stringify(data));
});
