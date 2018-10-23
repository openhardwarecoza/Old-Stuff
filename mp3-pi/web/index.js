var socket = io.connect('');
var files = [], filestag = [];

socket.on('files', function (data) {
		files = data;
	});

socket.on('playing', function (i) {
		console.log("Playing " + filestag[i].artist + ' - ' +filestag[i].title  )
		$('#playingsong').html('<span class="glyphicon glyphicon-play"></span>&nbsp;' +filestag[i].artist + ' - ' +filestag[i].title + '&nbsp;<span class="glyphicon glyphicon-music"></span>')
		$('#songtable tr').removeClass('highlight')
		$('#songtable tr').eq(i+1).addClass('highlight')
	});

socket.on('filestag', function (tags) {
	$('#songlist').empty();
		filestag = tags;
		for (i=0; i<filestag.length; i++) {
			var template = `
			<tr class="clickable-row" style="cursor: pointer" onclick="socket.emit('play', `+i+`)">
				<td>`+i+`</td>
				<td>`+filestag[i].artist+`</td>
				<td>`+filestag[i].title+`</td>
			</tr>

			`;
			$('#songlist').append(template);

		}
	});

  socket.on('speaker', function (data) {
  		console.log(data());
  	});


		$(document).ready(function(){
				socket.emit('refresh', true);
				// $('#songtable').on('click', 'tbody tr', function(event) {
				// 	console.log(this)
				// 	$(this).addClass('highlight').siblings().removeClass('highlight');
				// });


		    $('.filterable .btn-filter').click(function(){
		        var $panel = $(this).parents('.filterable'),
		        $filters = $panel.find('.filters input'),
		        $tbody = $panel.find('.table tbody');
		        if ($filters.prop('disabled') == true) {
		            $filters.prop('disabled', false);
		            $filters.first().focus();
		        } else {
		            $filters.val('').prop('disabled', true);
		            $tbody.find('.no-result').remove();
		            $tbody.find('tr').show();
		        }
		    });

		    $('.filterable .filters input').keyup(function(e){
		        /* Ignore tab key */
		        var code = e.keyCode || e.which;
		        if (code == '9') return;
		        /* Useful DOM data and selectors */
		        var $input = $(this),
		        inputContent = $input.val().toLowerCase(),
		        $panel = $input.parents('.filterable'),
		        column = $panel.find('.filters th').index($input.parents('th')),
		        $table = $panel.find('.table'),
		        $rows = $table.find('tbody tr');
		        /* Dirtiest filter function ever ;) */
		        var $filteredRows = $rows.filter(function(){
		            var value = $(this).find('td').eq(column).text().toLowerCase();
		            return value.indexOf(inputContent) === -1;
		        });
		        /* Clean previous no-result if exist */
		        $table.find('tbody .no-result').remove();
		        /* Show all rows, hide filtered ones (never do that outside of a demo ! xD) */
		        $rows.show();
		        $filteredRows.hide();
		        /* Prepend no-result row if all rows are filtered */
		        if ($filteredRows.length === $rows.length) {
		            $table.find('tbody').prepend($('<tr class="no-result text-center"><td colspan="'+ $table.find('.filters th').length +'">No result found</td></tr>'));
		        }
		    });
		});
