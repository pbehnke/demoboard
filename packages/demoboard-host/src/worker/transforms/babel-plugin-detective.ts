import wrapListener from './wrap-listener'

function listener(path, file, opts) {
	(path.isLiteral() ? addString : addExpression)(path.node, file, opts);
}

function addString(node, file, opts) {
	var val = attachNodes(opts) ? node : node.value;
	requireMetadata(file).push(val);
}

// I don't currently support requiring expressions.
function addExpression(node, file, opts) {
	// var val;

	// if (attachNodes(opts)) {
	// 	val = node;
	// } else {
	// 	val = {start: node.start, end: node.end};
	// 	val.loc = {
	// 		start: copyLoc(node.loc.start),
	// 		end: copyLoc(node.loc.end)
	// 	};
	// }

	// if (attachExpressionSource(opts)) {
	// 	val.code = file.code.slice(val.start, val.end);
	// }

	// requireMetadata(file).expressions.push(val);

	// return val;
}

function copyLoc(loc) {
	return loc && {line: loc.line, column: loc.column};
}

function requireMetadata(file) {
	var metadata = file.metadata;

	if (!metadata.requires) {
		metadata.requires = [];
	}

	return metadata.requires;
}

// OPTION EXTRACTION:

function attachExpressionSource(opts) {
	return Boolean(opts && opts.source);
}

function attachNodes(opts) {
	return Boolean(opts && opts.nodes);
}

export default wrapListener(listener, 'detective')