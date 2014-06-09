# Orquidea jQuery distribution

Work in progress.

Orquidea is jQuery (also web components) based framework that I started working on at my last day at Orquidea, Gran Canaria. It’s a library that should allow people to stitch embed on their web pages with a general query system, and if there is multiple entries embedded, all the content will be stitched together to a whole playlist, regardless of what music service used for playing the songs. Orquidea will lookup a matching music service for any entry, according to a special music URI scheme which Orquidea converts to a query.

## Getting started

Pull this project and copy the orquidea.js to your js folder and orquidea.css to your css folder. Then add links as usual to these files, you know how. Don't forget to make sure jQuery is included as well.

Then add the music elements to the page

 	<html>
 		<head>
 			...
 			<link rel="path/to/orquidea.css" type="text/css" />
 			<script src="path/to/orquidea.js" type="text/JavaScript"></script>
 			...
 		</head>
 		<body>
 			...
 			<h3>Sample playlist</h3>
 			<table width="100%" class="orquidea-tracklist">
				<thead>
					<th>#</th>
					<th>Title</th>
					<th>Artist</th>
					<th>Duration</th>
					<th>Album</th>
					<th>Source</th>
					<th></th>

				</thead>
				<tbody>
					<tr class="orquidea-song" data-uri="music://artist/Daft+Punk/album/Get+Lucky/track/Get+Lucky"></tr>
					<tr class="orquidea-song" data-uri="music://artist/AVICII/album/True/track/True"></tr>
					<tr class="orquidea-song" data-title="Test" data-uri="https://www.youtube.com/watch?v=mN84To5ndw0"></tr>
					<tr class="orquidea-song" data-title="Test" data-uri="https://www.youtube.com/watch?v=mN84To5ndw0"></tr>
				</tbody>
			</table>
			...
			<script>
			$('.orquidea-song').each(function (i) {
				$(this).orquidea();
			});
		</script>
		</body>
	</html>

Before the end of the body, add	the following

	<script>
		$('.orquidea-song').each(function (i) {
			$(this).orquidea();
		});
	</script>

Then it should make the songs as playlist.