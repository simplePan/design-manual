// results.js

var $ = require( 'jquery' );
var lunr = require( 'lunr' );

console.log($);

$(function(Query,utils) {
	var query = new Query(),
		site = location.protocol + "//" + location.host,
		// some utility functions
		utils = utils;

	console.log('in function(Query,utils)');

	query
	.setFromURL('query')
	.getJSON('/design-manual/search-index.json')
	.done(function(data) {
		console.log(data);
		var searchIndex,
			results,
			$resultsCount = $('.search-results-count'),
			$results = $('.search-results'),
			totalScore = 0,
			percentOfTotal;

		// PIECE 1
		// set up the allowable fields
		searchIndex = lunr(function() {
			this.field('title');
			this.field('category');
			this.field('content');
			this.ref('url');
			this.field('date');
		});

		// PIECE 2
		// add each item from posts.json to the index
		$.each(data,function(i,item) {
			searchIndex.add(item);
		});

		// PIECE 3
		// search for the query and store the results as an array
		results = searchIndex.search(query.get());

		// PIECE 4
		// add the title of each post into each result, too (this doesn't come standard with lunr.js)
		for(var result in results) {
			results[result].title = data.filter(function(post) {
				return post.url === results[result].ref;
			})[0].title;
		}

		// show how many results there were, in the DOM
		$resultsCount.append(results.length + (results.length === 1 ? ' result' : ' results') + ' for "' + query.get() +'"');

		// PIECE 5
		// get the total score of all items, so that we can divide each result into it, giving us a percentage
		$.each(results, function(i, result) {
			totalScore+=result.score;
		});

		// PIECE 6 & PIECE 7
		// append each result link, with a border that corresponds to a color with a strength equal to its percentage
		// of the total score
		$.each(results, function(i,result) {
			percentOfTotal = result.score/totalScore;

			$results.append('<li><a href="'+ site + result.ref +'">'+result.title+'</a></li>');
			$results.children('li').last().css({
				'border-left': '20px solid '+utils.shade('#ffffff',-percentOfTotal)
			});
		});
	});
}(Query,utils));
