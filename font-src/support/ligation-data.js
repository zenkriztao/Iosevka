"use strict";

const Parameters = require("./parameters");

module.exports = function applyLigationData(data, para, argv) {
	const optInBuildup = {};
	const optOutBuildup = {};

	const hives = {};
	hives["default"] = { caltBuildup: [] };
	for (const gr in data.simple) {
		hives["enable-" + gr] = { appends: { caltBuildup: [data.simple[gr].ligGroup] } };
		hives["disable-" + gr] = { removes: { caltBuildup: [data.simple[gr].ligGroup] } };
	}
	for (const gr in data.composite) {
		const comp = data.composite[gr];
		if (!comp.tag) continue;

		const ligSets = createBuildup(data.simple, comp.buildup);
		if (comp.isOptOut) {
			optOutBuildup[comp.tag] = ligSets;
		} else {
			optInBuildup[comp.tag] = ligSets;
		}
		if (!comp.isOptOut) {
			hives["ligset-" + gr] = { caltBuildup: ligSets };
		}
	}

	para.ligation = {
		defaultBuildup: { ...optInBuildup, ...optOutBuildup },
		caltBuildup: []
	};
	if (argv.ligations) {
		if (argv.ligations.inherits)
			Parameters.apply(para.ligation, hives, ["ligset-" + argv.ligations.inherits]);
		if (argv.ligations.disables)
			Parameters.apply(
				para.ligation,
				hives,
				argv.ligations.disables.map(x => `disable-${x}`)
			);
		if (argv.ligations.enables)
			Parameters.apply(
				para.ligation,
				hives,
				argv.ligations.enables.map(x => `enable-${x}`)
			);
	}
};

function createBuildup(simple, buildup) {
	let ligSet = new Set();
	for (const s of buildup) {
		if (!simple[s]) throw new Error("Cannot find simple ligation group " + s);
		ligSet.add(simple[s].ligGroup);
	}
	return Array.from(ligSet);
}
